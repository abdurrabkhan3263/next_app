"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { State } from "./definitions";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({ invalid_type_error: "Please Select a Customer" }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please Select a invoice Status",
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  // const rawFormData = Object.fromEntries(formData.entries()); --> we can you like this instead of below code
  // Object.fromEntries() method transforms a list of key-value pairs into an object.
  // Object.entries() method returns an array of a given object's own enumerable string-keyed property [key, value] pairs.
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  console.log(validatedFields);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }
  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`INSERT INTO invoices(customer_id, amount, status,date) VALUES(${customerId},${amountInCents},${status},${date})`;
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  revalidatePath("/dashboard/invoices"); // --> This is  Useful for updating statically generated content without waiting for a full rebuild or the next revalidation interval.
  redirect("/dashboard/invoices");
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  console.log("ID IS:- ", id, "FROMDATA IS:-  ", formData);
  const validatingFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatingFields.success) {
    return {
      errors: validatingFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  const { customerId, amount, status } = validatingFields.data;

  const amountInCents = amount * 100;
  try {
    await sql`UPDATE invoices
      SET customer_id = ${customerId} , amount = ${amountInCents} , status = ${status}
      WHERE id = ${id}
      `;
  } catch (error) {
    return {
      message: `Database Error : Failed to Update Invoice`,
    };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  try {
    if (!id) throw new Error("Invalid invoice id");

    await sql`DELETE FROM invoices
  WHERE id = ${id}
  `;
  } catch (error) {
    return {
      message: "Database Error : Failed to Delete Invoice",
    };
  }
  revalidatePath("/dashboard/invoices");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      console.log("Error Type:- ", error);
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

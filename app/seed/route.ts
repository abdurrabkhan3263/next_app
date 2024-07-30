import bcrypt from "bcrypt";
import { db } from "@vercel/postgres";
import { invoices, customers, revenue, users } from "../lib/placeholder-data";

const client = await db.connect();

const studentData = [
  {
    id: "bdfc8fa9-a6cb-4b5e-ada4-4fb94d4e4c12",
    name: "Alice Johnson",
    age: 16,
    marks: 85,
    address: "123 Maple Street, Springfield",
  },
  {
    id: "72b2aa6d-7d5c-4cad-a5a5-e35c50fd056e",
    name: "Bob Smith",
    age: 17,
    marks: 90,
    address: "456 Oak Avenue, Springfield",
  },
  {
    id: "6b89eac6-f7a5-495c-9163-5483caaf7be4",
    name: "Carol Davis",
    age: 16,
    marks: 88,
    address: "789 Pine Road, Springfield",
  },
  {
    id: "6e16233b-72eb-4fad-ab61-cce35cba9973",
    name: "David Wilson",
    age: 18,
    marks: 92,
    address: "101 Birch Lane, Springfield",
  },
  {
    id: "b65152b2-f438-49f9-84d2-3cd13921e560",
    name: "Eva Brown",
    age: 17,
    marks: 87,
    address: "202 Cedar Court, Springfield",
  },
  {
    id: "4c58e5bc-6ba6-4c42-bc24-922a7f746266",
    name: "Frank Miller",
    age: 16,
    marks: 83,
    address: "303 Elm Street, Springfield",
  },
  {
    id: "6985e13d-ef15-4d41-8306-2e7a174f69c8",
    name: "Grace Taylor",
    age: 18,
    marks: 91,
    address: "404 Walnut Avenue, Springfield",
  },
  {
    id: "1f725b3b-e5f0-43c9-a6e3-ca9131af847a",
    name: "Henry Anderson",
    age: 17,
    marks: 89,
    address: "505 Cherry Drive, Springfield",
  },
  {
    id: "cf455738-dad5-4543-a8a8-b02e74ad561c",
    name: "Isabel Thomas",
    age: 16,
    marks: 86,
    address: "606 Poplar Road, Springfield",
  },
  {
    id: "722f9e5c-72e2-4dda-9bba-445d8e45faaf",
    name: "Jack Lee",
    age: 18,
    marks: 93,
    address: "707 Maple Boulevard, Springfield",
  },
];

const studentCity = [
  {
    id: studentData[0].id,
    city: "Mumbai",
  },
  {
    id: studentData[1].id,
    city: "Tokyo",
  },
  {
    id: studentData[2].id,
    city: "Mumbai",
  },
  {
    id: studentData[3].id,
    city: "Delhi",
  },
  {
    id: studentData[4].id,
    city: "New york",
  },
  {
    id: studentData[5].id,
    city: "Landon",
  },
  {
    id: studentData[6].id,
    city: "Delhi",
  },
  {
    id: studentData[7].id,
    city: "San francisco",
  },
  {
    id: studentData[8].id,
    city: "New york",
  },
  {
    id: studentData[9].id,
    city: "San francisco",
  },
];

async function seedUsers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await client.sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return client.sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );

  return insertedUsers;
}

async function seedInvoices() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => client.sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => client.sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await client.sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => client.sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `
    )
  );

  return insertedRevenue;
}

async function seedStudent() {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.sql`
    CREATE TABLE IF NOT EXISTS student(
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      age INT NOT NULL,
      marks INT NOT NULL,
      address VARCHAR(255) NOT NULL
    )
    `;

    const insertStudent = await Promise.all(
      studentData.map(
        (data) => client.sql`
          INSERT INTO student(name, age, marks, address)
          VALUES (${data.name}, ${data.age}, ${data.marks}, ${data.address})
        `
      )
    );
    return insertStudent;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function seedStudentCity() {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await client.sql`CREATE TABLE IF NOT EXISTS city(
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city VARCHAR(155) NOT NULL
    )`;

    const insertCity = await Promise.all(
      studentCity.map(
        (data) => client.sql`INSERT INTO city(id,city)
      VALUES(${data.id},${data.city})
      `
      )
    );
    return insertCity;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function GET() {
  return Response.json({
    message:
      "Uncomment this file and remove this line. You can delete this file when you are finished.",
  });
  try {
    await client.sql`BEGIN`;
    await seedStudentCity();
    await seedStudent();
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    await client.sql`COMMIT`;

    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    await client.sql`ROLLBACK`;
    return Response.json({ error }, { status: 500 });
  }
}

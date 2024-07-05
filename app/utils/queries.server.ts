import { prisma } from "./prisma.server";
import { getAuthFromRequest } from "./auth";
import crypto from "crypto";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const allowedFileTypes = [
  "c", "cpp", "css", "csv", "docx", "gif", "html", "java", "jpeg", "jpg",
  "js", "json", "md", "pdf", "php", "png", "pptx", "py", "rb", "tar", 
  "tex", "ts", "txt", "webp", "xlsx", "xml", "zip"
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to save files to OpenAI and return the fileId
async function saveFile(file, userId, type) {
  try {
    const fileExtension = path.extname(file.name).slice(1).toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      throw new Error(`Unsupported file type: ${fileExtension}`);
    }

    const uploadDir = path.resolve(__dirname, '../routes/uploads');
    await fsPromises.mkdir(uploadDir, { recursive: true });

    const fileName = `${userId}_${type}_${Date.now()}_${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await fsPromises.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    const fileUploadResponse = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'assistants',
    });

    const fileId = fileUploadResponse.id;
    await fsPromises.unlink(filePath);

    return fileId;
  } catch (error) {
    console.error("Error saving file:", error);
    throw error;
  }
}

// Function to save user details and files
export async function saveDetails(contractDetails, files, preferUpload, request) {
  const { profession, community, city, province, address } = contractDetails;
  const userId = await getAuthFromRequest(request);

  if (!userId) {
    return false;
  }

  const userExists = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  if (!userExists) {
    return false;
  }

  console.log("files " + JSON.stringify(files));

  const payrollFileId = files.payrollFile ? await saveFile(files.payrollFile, userId, 'payroll') : null;
  const laborLifeFileId = files.laborLifeFile ? await saveFile(files.laborLifeFile, userId, 'labor_life') : null;
  const contractFileId = files.contractFile ? await saveFile(files.contractFile, userId, 'contract') : null;

  console.log(payrollFileId);
  console.log(laborLifeFileId);
  console.log(contractFileId);

  const updatedUserDetails = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      profession,
      community,
      province,
      address,
      payrollFile: payrollFileId,
      laborLifeFile: laborLifeFileId,
      contractFile: contractFileId,
      preferUpload
    },
  });

  return updatedUserDetails;
}

// Function to save contract details
export async function saveContractDetails(contractDetails, request) {
  const { startDate, endDate, contractType, trialPeriod, workdayType, weeklyHours, netSalary, grossSalary, extraPayments, sector, cotizationGroup } = contractDetails;
  const userId = await getAuthFromRequest(request);
  if (!userId) {
    return null;
  }

  let userExists = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: { id: true },
  });

  if (!userExists) {
    return false;
  }

  const trialPeriodBool = trialPeriod === 'yes';

  const updatedContractDetails = await prisma.contract.upsert({
    where: { userId: parseInt(userId) },
    update: {
      startDate,
      endDate,
      contractType,
      trialPeriod: trialPeriodBool,
      workdayType,
      weeklyHours: parseFloat(weeklyHours),
      netSalary: parseFloat(netSalary),
      grossSalary: parseFloat(grossSalary),
      extraPayments: parseInt(extraPayments),
      sector,
      cotizationGroup,
    },
    create: {
      userId: parseInt(userId),
      startDate,
      endDate,
      contractType,
      trialPeriod: trialPeriodBool,
      workdayType,
      weeklyHours: parseFloat(weeklyHours),
      netSalary: parseFloat(netSalary),
      grossSalary: parseFloat(grossSalary),
      extraPayments: parseInt(extraPayments),
      sector,
      cotizationGroup,
    },
  });

  return updatedContractDetails;
}

// Function to check if an account exists
export async function accountExists(email: string) {
  let account = await prisma.user.findUnique({
    where: { email: email },
    select: { id: true },
  });

  return Boolean(account);
}

// Function to create an account
export async function createAccount(email: string, password: string, firstName: string, lastName: string) {
  let salt = crypto.randomBytes(16).toString("hex");
  let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex");

  return prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      password: {
        create: {
          hash,
          salt,
        },
      },
    },
  });
}

// Function to login
export async function login(email: string, password: string) {
  let user = await prisma.user.findUnique({
    where: { email: email },
    include: {
      password: true,
    },
  });

  if (!user || !user.password) {
    return false;
  }

  let hash = crypto.pbkdf2Sync(password, user.password.salt, 1000, 64, "sha256").toString("hex");

  if (hash !== user.password.hash) {
    return false;
  }

  return user.id;
}

// Function to get user email
export async function getEmail(request: Request): Promise<string | null> {
  let userId = await getAuthFromRequest(request);

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: { email: true },
  });

  return user?.email ?? null;
}

// Function to get user profile
export async function getUserProfile(request: Request) {
  const userId = await getAuthFromRequest(request);
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      bio: true,
      gender: true,
      birthday: true,
      city: true,
    },
  });

  return user;
}

// Function to save user profile
export async function saveProfile(email: string, firstName: string, lastName: string, bio: string, gender: string, birthday: Date, avatar: string, city: string) {
  let user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    return false;
  }

  const updatedUser = await prisma.user.update({
    where: { email: email },
    data: {
      firstName,
      lastName,
      bio,
      gender,
      birthday,
      avatar,
      city,
    },
  });

  return updatedUser;
}

// Function to get user details
export async function getUserDetails(request: Request) {
  const userId = await getAuthFromRequest(request);
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      email: true,
      profession: true,
      community: true,
      city: true,
      province: true,
      address: true,
      preferUpload: true,
      payrollFile: true,
      laborLifeFile: true,
      contractFile: true,
    },
  });

  return user || null;
}

// Function to fetch user contract details
export async function fetchUserContractDetails(request: Request) {
  const userId = await getAuthFromRequest(request);
  if (!userId) {
    return null;
  }

  const contractDetails = await prisma.contract.findUnique({
    where: { userId: parseInt(userId) },
    select: {
      startDate: true,
      endDate: true,
      contractType: true,
      trialPeriod: true,
      workdayType: true,
      weeklyHours: true,
      netSalary: true,
      grossSalary: true,
      extraPayments: true,
      sector: true,
      cotizationGroup: true,
    },
  });

  return contractDetails;
}

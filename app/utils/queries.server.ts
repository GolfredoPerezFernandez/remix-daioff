import { prisma } from "./prisma.server";
import { getAuthFromRequest } from "./auth";
import crypto from "crypto";

// Función para verificar si una cuenta existe
export async function accountExists(email: string) {
  let account = await prisma.user.findUnique({
    where: { email: email },
    select: { id: true },
  });

  return Boolean(account);
}

// Función para crear una cuenta
export async function createAccount(email: string, password: string, firstName: string, lastName: string) {
  let salt = crypto.randomBytes(16).toString("hex");
  let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex");

  return prisma.user.create({
    data: {
      email: email,
      firstName: firstName,
      lastName: lastName,
      password: {
        create: {
          hash,
          salt,
        },
      },
    },
  });
}

// Función para iniciar sesión
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

// Función para obtener el email del usuario
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

// Función para obtener el perfil del usuario
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

// Función para guardar el perfil del usuario
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
      firstName: firstName,
      lastName: lastName,
      bio: bio,
      gender: gender,
      birthday: birthday,
      avatar: avatar,
      city: city,
    },
  });

  return updatedUser;
}

// Función para obtener los detalles del usuario
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
    },
  });

  return user || null;
}

// Función para guardar los detalles del contrato
export async function saveDetails(contractDetails, request) {
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

  const updatedUserDetails = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      profession,
      community,
      city,
      province,
      address,
    },
  });

  return updatedUserDetails;
}

// Función para guardar los detalles del contrato
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
      startDate: startDate,
      endDate: endDate,
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
      startDate: startDate,
      endDate: endDate,
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

// Función para obtener los detalles del contrato del usuario
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

export async function getAssistantIdByCommunity(community: string) {
  switch (community) {
    case "Aragón":
      return "asst_SzWrRCaCC7woGYrWLhtbReAL";
    case "Extremadura":
      return "asst_DoBIPo3N64BoPC63Ms6TNaU2";
    case "Comunidad de Madrid":
      return "asst_RHpDTvU7VbdfGdS2papFOKcG";
    case "La Rioja":
      return "asst_KuxbJbUWqxcjTF4sPhDzPN6q";
    case "Canarias":
      return "asst_HCUtCsXW37AAQ8vRkbRhD19t";
    case "Comunidad Valenciana":
      return "asst_N8BECCEhAp9YncXlliJYt0f2";
    case "Islas Baleares":
      return "asst_RP1Zz7s98rO2u9zqfRWZTelF";
    case "Cantabria":
      return "asst_rQd9DNKGALLebwS4h6BOdURh";
    case "Castilla La Mancha":
      return "asst_IXwMcQ9MWCgDhWxdeVOlMmg7";
    default:
      return null;
  }
}

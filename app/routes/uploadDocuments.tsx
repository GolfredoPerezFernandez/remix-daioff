import { useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/server-runtime";
import { getUserDetails, saveDetails, fetchUserContractDetails, saveContractDetails } from "~/utils/queries.server";

// Define loader function to preload data if necessary
export const loader: LoaderFunction = async ({ request }) => {
  const contractDetails = await getUserDetails(request);
  const userContractDetails = await fetchUserContractDetails(request);
  if (!contractDetails) {
    return redirect("/");
  }
  return json({ contractDetails, userContractDetails });
};

// Define action function to handle form submissions
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const contractDetails = {
    profession: formData.get("profession"),
    community: formData.get("community"),
    province: formData.get("province"),
    address: formData.get("address"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    contractType: formData.get("contractType"),
    trialPeriod: formData.get("trialPeriod"),
    workdayType: formData.get("workdayType"),
    weeklyHours: formData.get("weeklyHours"),
    netSalary: formData.get("netSalary"),
    grossSalary: formData.get("grossSalary"),
    extraPayments: formData.get("extraPayments"),
    sector: formData.get("sector"),
    cotizationGroup: formData.get("cotizationGroup"),
    contractFile: formData.get("contractFile"),
    payrollFile: formData.get("payrollFile"),
    laborLifeFile: formData.get("laborLifeFile")
  };

  const saveResult = await saveDetails(contractDetails, request);
  const saveUserContractResult = await saveContractDetails(contractDetails, request);
  return json({ saveResult, saveUserContractResult });
};

const provincesByCommunity = {
  "Cataluña": ["Barcelona", "Girona", "Lleida", "Tarragona"],
  "Madrid": ["Madrid"],
  "Andalucía": ["Sevilla", "Málaga", "Córdoba", "Granada", "Huelva", "Jaén", "Almería", "Cádiz"],
  "Aragón": ["Zaragoza", "Huesca", "Teruel"],
  "Extremadura": ["Badajoz", "Cáceres"],
  "Comunidad de Madrid": ["Madrid"],
  "La Rioja": ["Logroño"],
  "Canarias": ["Santa Cruz de Tenerife", "Las Palmas"],
  "Comunidad Valenciana": ["Valencia", "Alicante", "Castellón"],
  "Islas Baleares": ["Palma", "Ibiza", "Menorca"],
  "Cantabria": ["Santander"],
  "Castilla La Mancha": ["Toledo", "Ciudad Real", "Albacete", "Cuenca", "Guadalajara"]
};

const typesValues3 = [
  { label: 'Operario', value: 'Operario' },
  { label: 'Técnico', value: 'Técnico' },
  { label: 'Ingeniero', value: 'Ingeniero' },
  { label: 'Supervisor de producción', value: 'Supervisor de producción' },
  { label: 'Especialista en calidad', value: 'Especialista en calidad' },
  { label: 'Mantenimiento industrial', value: 'Mantenimiento industrial' },
  { label: 'Albañil', value: 'Albañil' },
  { label: 'Constructor', value: 'Constructor' },
  { label: 'Carpintero', value: 'Carpintero' },
  { label: 'Electricista', value: 'Electricista' },
  { label: 'Fontanero', value: 'Fontanero' },
  { label: 'Pintor', value: 'Pintor' },
  { label: 'Encargado de obra', value: 'Encargado de obra' },
  { label: 'Atención al cliente', value: 'Atención al cliente' },
  { label: 'Administrativo', value: 'Administrativo' },
  { label: 'Comercial', value: 'Comercial' },
  { label: 'Gerente de establecimiento', value: 'Gerente de establecimiento' },
  { label: 'Personal de limpieza', value: 'Personal de limpieza' },
  { label: 'Seguridad', value: 'Seguridad' },
  { label: 'Médico', value: 'Médico' },
  { label: 'Enfermero/a', value: 'Enfermero/a' },
  { label: 'Auxiliar de enfermería', value: 'Auxiliar de enfermería' },
  { label: 'Técnico en radiología', value: 'Técnico en radiología' },
  { label: 'Farmacéutico', value: 'Farmacéutico' },
  { label: 'Profesor', value: 'Profesor' },
  { label: 'Maestro', value: 'Maestro' },
  { label: 'Educador infantil', value: 'Educador infantil' },
  { label: 'Director de centro educativo', value: 'Director de centro educativo' },
  { label: 'Desarrollador de software', value: 'Desarrollador de software' },
  { label: 'Analista de sistemas', value: 'Analista de sistemas' },
  { label: 'Técnico de soporte IT', value: 'Técnico de soporte IT' },
  { label: 'Administrador de redes', value: 'Administrador de redes' },
  { label: 'Camarero', value: 'Camarero' },
  { label: 'Cocinero', value: 'Cocinero' },
  { label: 'Recepcionista de hotel', value: 'Recepcionista de hotel' },
  { label: 'Guía turístico', value: 'Guía turístico' },
  { label: 'Conductor', value: 'Conductor' },
  { label: 'Operador logístico', value: 'Operador logístico' },
  { label: 'Piloto', value: 'Piloto' },
  { label: 'Controlador aéreo', value: 'Controlador aéreo' }
];

const typesValues2 = [
  { label: 'Indefinido', value: 'Indefinido' },
  { label: 'Temporal', value: 'Temporal' },
  { label: 'Formación y Aprendizaje', value: 'Formación' },
  { label: 'Prácticas', value: 'Prácticas' },
];

const workdayTypes = [
  { label: 'Completa', value: 'completa' },
  { label: 'Parcial', value: 'parcial' },
  { label: 'Flexible', value: 'flexible' },
  { label: 'Teletrabajo', value: 'teletrabajo' },
  { label: 'Turnos', value: 'turnos' }
];

const jobCategories = [
  { label: 'Grupo 1: Ingenieros y Licenciados', value: 'Ingenieros y Licenciados' },
  { label: 'Grupo 2: Ingenieros Técnicos, Peritos y Ayudantes Titulados', value: 'Ingenieros Técnicos, Peritos y Ayudantes Titulados' },
  { label: 'Grupo 3: Jefes Administrativos y de Taller', value: 'Jefes Administrativos y de Taller' },
  { label: 'Grupo 4: Ayudantes no Titulados', value: 'Ayudantes no Titulados' },
  { label: 'Grupo 5: Oficiales Administrativos', value: 'Oficiales Administrativos' },
  { label: 'Grupo 6: Subalternos', value: 'Subalternos' },
  { label: 'Grupo 7: Auxiliares Administrativos', value: 'Auxiliares Administrativos' },
  { label: 'Grupo 8: Oficiales de Primera y Segunda', value: 'Oficiales de Primera y Segunda' },
  { label: 'Grupo 9: Oficiales de Tercera y Especialistas', value: 'Oficiales de Tercera y Especialistas' },
  { label: 'Grupo 10: Peones', value: 'Peones' },
  { label: 'Grupo 11: Trabajadores menores de dieciocho años, sea cual sea su categoría profesional', value: 'Trabajadores menores de dieciocho años, sea cual sea su categoría profesional' }
];

const sectorsArray = [
  { label: 'Administración y gestión', value: 'Administración y gestión' },
  { label: 'Agricultura y ganadería', value: 'Agricultura y ganadería' },
  { label: 'Industria alimentaria', value: 'Industria alimentaria' },
  { label: 'Grandes almacenes', value: 'Grandes almacenes' },
  { label: 'Comercio', value: 'Comercio' },
  { label: 'Construcción', value: 'Construcción' },
  { label: 'Actividades físico-deportivas', value: 'Actividades físico-deportivas' },
  { label: 'Educación', value: 'Educación' },
  { label: 'Energía y agua', value: 'Energía y agua' },
  { label: 'Finanzas y seguros', value: 'Finanzas y seguros' },
  { label: 'Hostelería y turismo', value: 'Hostelería y turismo' },
  { label: 'Información, comunicación y artes gráficas', value: 'Información, comunicación y artes gráficas' },
  { label: 'Servicios medioambientales', value: 'Servicios medioambientales' },
  { label: 'Metal', value: 'Metal' },
  { label: 'Pesca y acuicultura', value: 'Pesca y acuicultura' },
  { label: 'Industria química y vidrio', value: 'Industria química y vidrio' },
  { label: 'Sanidad', value: 'Sanidad' },
  { label: 'Otros servicios', value: 'Otros servicios' },
  { label: 'Servicios a las empresas', value: 'Servicios a las empresas' },
  { label: 'Telecomunicaciones', value: 'Telecomunicaciones' },
  { label: 'Textil, confección y piel', value: 'Textil, confección y piel' },
  { label: 'Transporte y logística', value: 'Transporte y logística' },
  { label: 'Economía social', value: 'Economía social' }
];

export default function ContractDetails() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const fetcher = useFetcher();

  const [contractDetails, setContractDetails] = useState(loaderData.contractDetails || {});
  const [userContractDetails, setUserContractDetails] = useState(loaderData.userContractDetails || {});
  const [provinces, setProvinces] = useState([]);
  const [contractFile, setContractFile] = useState(null);
  const [payrollFile, setPayrollFile] = useState(null);
  const [laborLifeFile, setLaborLifeFile] = useState(null);
  const [contractFileName, setContractFileName] = useState('');
  const [payrollFileName, setPayrollFileName] = useState('');
  const [laborLifeFileName, setLaborLifeFileName] = useState('');
  const allowedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  useEffect(() => {
    if (contractDetails.community) {
      setProvinces(provincesByCommunity[contractDetails.community] || []);
    }
  }, [contractDetails.community]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setContractDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
    setUserContractDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleFileChange = (event, setFile, setFileName) => {
    const file = event.target.files[0];
    if (file && allowedFileTypes.includes(file.type)) {
      setFile(file);
      setFileName(file.name);
    } else {
      alert("Please upload a valid file.");
    }
  };

  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-200";

  return (
    <div className="relative h-screen w-full lg:ps-64">
      <div className="max-w-4xl px-4 py-10 sm:px-6 lg:px-8 mx-auto">
      

           
            <div className="mt-5 flex justify-end gap-x-2">
              <button
                type="submit"
                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                Guardar Cambios
              </button>
              </div>
            </div>
    </div>
  );
}

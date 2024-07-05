import { useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { json, redirect } from "@remix-run/server-runtime";
import { getUserDetails, saveDetails, fetchUserContractDetails, saveContractDetails } from "~/utils/queries.server";

export const loader = async ({ request }) => {
  const contractDetails = await getUserDetails(request);
  const userContractDetails = await fetchUserContractDetails(request);
  if (!contractDetails) {
    return redirect("/");
  }
  return json({ contractDetails, userContractDetails });
};

export const action = async ({ request }) => {
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
  };

  const files = {
    payrollFile: formData.get("payrollFile"),
    laborLifeFile: formData.get("laborLifeFile"),
    contractFile: formData.get("contractFile"),
  };

  const preferUpload = formData.get("preferUpload") === "on";
console.log(" payrollFile "+formData.get("payrollFile"))
  const saveResult = await saveDetails(contractDetails, files, preferUpload, request);
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
  const [payrollFile, setPayrollFile] = useState(null);
  const [laborLifeFile, setLaborLifeFile] = useState(null);
  const [contractFile, setContractFile] = useState(null);
  const [preferUpload, setPreferUpload] = useState(loaderData.contractDetails?.preferUpload || false);
  const [filePreviews, setFilePreviews] = useState({ payrollFile: null, laborLifeFile: null, contractFile: null });
  const [fileNames, setFileNames] = useState({ payrollFile: '', laborLifeFile: '', contractFile: '' });

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

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    const file = files[0];
    if (file) {
      if (name === "payrollFile") setPayrollFile(file);
      else if (name === "laborLifeFile") setLaborLifeFile(file);
      else if (name === "contractFile") setContractFile(file);
    } else {
      alert("Please upload a valid file.");
    }
  };

  const handleCheckboxChange = () => {
    setPreferUpload(!preferUpload);
  };

  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-200";

  return (
    <div className="relative h-screen w-full lg:ps-64">
      <div className="max-w-4xl px-4 py-10 sm:px-6 lg:px-8 mx-auto">
        <div className="bg-white rounded-xl shadow p-4 sm:p-7 dark:bg-neutral-800">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-200">Detalles del Contrato</h2>
            <p className="text-sm text-gray-600 dark:text-neutral-400">Gestiona los detalles de tu contrato.</p>
          </div>
          <form method="POST" encType="multipart/form-data" className="space-y-6">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="preferUpload" 
                name="preferUpload"
                checked={preferUpload} 
                onChange={handleCheckboxChange} 
                className="relative w-[3.25rem] h-7 p-px bg-gray-100 border-transparent text-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:ring-blue-600 disabled:opacity-50 disabled:pointer-events-none checked:bg-none checked:text-blue-600 checked:border-blue-600 focus:checked:border-blue-600 dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-600
                before:inline-block before:size-6 before:bg-white checked:before:bg-blue-200 before:translate-x-0 checked:before:translate-x-full before:rounded-full before:shadow before:transform before:ring-0 before:transition before:ease-in-out before:duration-200 dark:before:bg-neutral-400 dark:checked:before:bg-blue-200"
              />
              <label htmlFor="preferUpload" className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Prefiero cargar archivos</label>
            </div>

            {preferUpload ? (
              <>
                <div>
                  <label htmlFor="payrollFile" className={labelClass}>Archivo de Nómina</label>
                  <input type="file" name="payrollFile" accept=".pdf,.jpg,.png" onChange={handleFileChange} />
                </div>
                <div>
                  <label htmlFor="laborLifeFile" className={labelClass}>Archivo de Vida Laboral</label>
                  <input type="file" name="laborLifeFile" accept=".pdf,.jpg,.png" onChange={handleFileChange} />
                </div>
                <div>
                  <label htmlFor="contractFile" className={labelClass}>Archivo de Contrato</label>
                  <input type="file" name="contractFile" accept=".pdf,.jpg,.png" onChange={handleFileChange} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="profession" className={labelClass}>Profesión</label>
                  <select
                    name="profession"
                    value={contractDetails.profession || ''}
                    onChange={handleInputChange}
                    className="py-2 mt-2 px-3 block w-full border-gray-300 shadow-sm text-sm rounded-lg focus:border-red-500 focus:ring-red-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                  >
                    <option value="">Seleccione una profesión</option>
                    {typesValues3.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="community" className={labelClass}>Comunidad Autónoma</label>
                  <select
                    name="community"
                    value={contractDetails.community || ''}
                    onChange={handleInputChange}
                    className="py-2 mt-2 px-3 block w-full border-gray-300 shadow-sm text-sm rounded-lg focus:border-red-500 focus:ring-red-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                  >
                    <option value="">Seleccione una comunidad</option>
                    {Object.keys(provincesByCommunity).map((community) => (
                      <option key={community} value={community}>{community}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="province" className={labelClass}>Provincia</label>
                  <select
                    name="province"
                    value={contractDetails.province || ''}
                    onChange={handleInputChange}
                    className="py-2 mt-2 px-3 block w-full border-gray-300 shadow-sm text-sm rounded-lg focus:border-red-500 focus:ring-red-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                  >
                    <option value="">Seleccione una provincia</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="address" className={labelClass}>Dirección</label>
                  <input
                    type="text"
                    name="address"
                    value={contractDetails.address || ''}
                    onChange={handleInputChange}
                    className="py-2 mt-2 px-3 block w-full border-gray-300 shadow-sm text-sm rounded-lg focus:border-red-500 focus:ring-red-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                  />
                </div>
                <div>
                  <label htmlFor="startDate" className={labelClass}>Fecha de inicio del contrato</label>
                  <input
                    type="date"
                    name="startDate"
                    value={userContractDetails.startDate || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className={labelClass}>Fecha de finalización del contrato</label>
                  <input
                    type="date"
                    name="endDate"
                    value={userContractDetails.endDate || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="contractType" className={labelClass}>Tipo de contrato</label>
                  <select
                    name="contractType"
                    value={userContractDetails.contractType || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    {typesValues2.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="trialPeriod" className={labelClass}>Periodo de prueba</label>
                  <select
                    name="trialPeriod"
                    value={userContractDetails.trialPeriod || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="yes">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="workdayType" className={labelClass}>Tipo de jornada</label>
                  <select
                    name="workdayType"
                    value={userContractDetails.workdayType || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    {workdayTypes.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="weeklyHours" className={labelClass}>Horas semanales</label>
                  <input
                    type="number"
                    name="weeklyHours"
                    value={userContractDetails.weeklyHours || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="netSalary" className={labelClass}>Salario Neto</label>
                  <input
                    type="number"
                    name="netSalary"
                    value={userContractDetails.netSalary || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="grossSalary" className={labelClass}>Salario Bruto</label>
                  <input
                    type="number"
                    name="grossSalary"
                    value={userContractDetails.grossSalary || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="extraPayments" className={labelClass}>Pagas Extras</label>
                  <input
                    type="number"
                    name="extraPayments"
                    value={userContractDetails.extraPayments || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="sector" className={labelClass}>Sector / Sindicato</label>
                  <select
                    name="sector"
                    value={userContractDetails.sector || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    {sectorsArray.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="cotizationGroup" className={labelClass}>Grupo de Cotización</label>
                  <select
                    name="cotizationGroup"
                    value={userContractDetails.cotizationGroup || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    {jobCategories.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="mt-5 flex justify-end gap-x-2">
              <button
                type="submit"
                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useActionData, useFetcher, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/server-runtime";
import { getUserDetails, saveDetails } from "~/utils/queries.server";

// Define loader function to preload data if necessary
export const loader: LoaderFunction = async ({ request }) => {
  const contractDetails = await getUserDetails(request);
  if (!contractDetails) {
    return redirect("/");
  }
  return json(contractDetails);
};

// Define action function to handle form submissions
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const contractDetails = {
    profession: formData.get("profession"),
    community: formData.get("community"),
    province: formData.get("province"),
    address: formData.get("address"),
  };

  const saveResult = await saveDetails(contractDetails, request);
  return json(saveResult);
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

export default function ContractDetails() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const fetcher = useFetcher();

  const [contractDetails, setContractDetails] = useState(loaderData || {});
  const [provinces, setProvinces] = useState([]);

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
  };

  return (
    <div className="relative h-screen w-full lg:ps-64">
      <div className="max-w-2xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div className="bg-white rounded-xl shadow p-4 sm:p-7 dark:bg-neutral-900">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-neutral-200">
              Información del contrato
            </h2>
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Maneja tus detalles de contrato
            </p>
          </div>

          <form method="POST">
            <div className="py-6 first:pt-0 last:pb-0 border-t first:border-transparent border-gray-200 dark:border-neutral-700 dark:first:border-transparent">
              <label htmlFor="profession" className="inline-block text-sm font-medium dark:text-white">
                Profesión
              </label>
              <select
                name="profession"
                value={contractDetails.profession || ''}
                onChange={handleInputChange}
                className="py-2 mt-2 px-3 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-red-500 focus:ring-red-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              >
                <option value="">Seleccione una profesión</option>
                {typesValues3.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="py-6 border-t border-gray-200 dark:border-neutral-700">
              <label htmlFor="community" className="inline-block text-sm font-medium dark:text-white">
                Comunidad Autónoma
              </label>
              <select
                name="community"
                value={contractDetails.community || ''}
                onChange={handleInputChange}
                className="py-2 mt-2 px-3 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-red-500 focus:ring-red-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              >
                <option value="">Seleccione una comunidad</option>
                {Object.keys(provincesByCommunity).map((community) => (
                  <option key={community} value={community}>{community}</option>
                ))}
              </select>
            </div>

            <div className="py-6 border-t border-gray-200 dark:border-neutral-700">
              <label htmlFor="province" className="inline-block text-sm font-medium dark:text-white">
                Provincia
              </label>
              <select
                name="province"
                value={contractDetails.province || ''}
                onChange={handleInputChange}
                className="py-2 mt-2 px-3 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-red-500 focus:ring-red-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              >
                <option value="">Seleccione una provincia</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            <div className="py-6 border-t border-gray-200 dark:border-neutral-700">
              <label htmlFor="address" className="inline-block text-sm font-medium dark:text-white">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={contractDetails.address || ''}
                onChange={handleInputChange}
                className="py-2 mt-2 px-3 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-red-500 focus:ring-red-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              />
            </div>

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

import { useActionData, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/server-runtime";
import { useState } from "react";
import { fetchUserContractDetails, saveContractDetails } from "~/utils/queries.server";

// Define loader function to preload data if necessary
export const loader: LoaderFunction = async ({ request }) => {
    const userContractDetails = await fetchUserContractDetails(request);
    if (userContractDetails) {
        return json(userContractDetails);
    }
    return json({});
};

// Define action function to handle form submissions
export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const contractDetails = {
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
        cotizationGroup: formData.get("cotizationGroup")
    };
    const saveResult = await saveContractDetails(contractDetails, request);
    return json(saveResult);
};

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

// Main component for contract details
export default function ContractDetails() {
    const actionData = useActionData();
    const loaderData = useLoaderData();
    
    const [contractDetails, setContractDetails] = useState(loaderData);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setContractDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    return (
        <div className="relative h-screen w-full lg:ps-64">
            <div className="max-w-4xl px-4 py-10 sm:px-6 lg:px-8 mx-auto">
                <div className="bg-white rounded-xl shadow p-4 sm:p-7 dark:bg-neutral-800">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-200">
                            Detalles del Contrato
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-neutral-400">
                            Gestiona los detalles de tu contrato.
                        </p>
                    </div>
                    <form method="POST" className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Fecha de inicio del contrato
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={contractDetails.startDate || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Fecha de finalización del contrato
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={contractDetails.endDate || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Tipo de contrato
                            </label>
                            <select
                                name="contractType"
                                value={contractDetails.contractType || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                {typesValues2.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Periodo de prueba
                            </label>
                            <select
                                name="trialPeriod"
                                value={contractDetails.trialPeriod || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="yes">Sí</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Tipo de jornada
                            </label>
                            <select
                                name="workdayType"
                                value={contractDetails.workdayType || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                {workdayTypes.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Horas semanales
                            </label>
                            <input
                                type="number"
                                name="weeklyHours"
                                value={contractDetails.weeklyHours || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Salario Neto
                            </label>
                            <input
                                type="number"
                                name="netSalary"
                                value={contractDetails.netSalary || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Salario Bruto
                            </label>
                            <input
                                type="number"
                                name="grossSalary"
                                value={contractDetails.grossSalary || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Pagas Extras
                            </label>
                            <input
                                type="number"
                                name="extraPayments"
                                value={contractDetails.extraPayments || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Sector / Sindicato
                            </label>
                            <select
                                name="sector"
                                value={contractDetails.sector || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                {sectorsArray.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Grupo de Cotización
                            </label>
                            <select
                                name="cotizationGroup"
                                value={contractDetails.cotizationGroup || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                {jobCategories.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
    
                        <div className="mt-5 flex justify-end gap-x-2">
                            <button
                                type="submit"
                                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
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

import { useActionData, useLoaderData } from "@remix-run/react";
import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/server-runtime";
import { useState } from "react";
import { getEmail, getUserProfile, saveProfile } from "~/utils/queries.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const email = await getEmail(request);
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const bio = formData.get("bio");
  const gender = formData.get("gender");
  const birthday = formData.get("birthday");
  const avatar = formData.get("avatar");
  const city = formData.get("city");

  if (!email) {
    return json({ success: false, message: "User not found" });
  }

  const updatedUser = await saveProfile(email, firstName, lastName, bio, gender, new Date(birthday), avatar, city);
  if (!updatedUser) {
    return json({ success: false, message: "User not found or update failed." });
  }

  return json({ success: true, message: "Profile updated successfully.", user: updatedUser });
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUserProfile(request);
  if (!user) {
    return redirect('/'); // Or redirect to a login page
  }

  return json({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    bio: user.bio || '',
    gender: user.gender || '',
    birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
    city: user.city || '',
  });
};

const cities = [
  "Barcelona", "Madrid", "Sevilla", "Valencia", "Zaragoza", "Málaga", "Murcia", 
  "Palma", "Las Palmas", "Bilbao", "Alicante", "Córdoba", "Valladolid", 
  "Vitoria", "Granada", "Oviedo", "Santa Cruz de Tenerife", "Pamplona", 
  "Almería", "San Sebastián"
];

export default function Profile() {
  const actionData = useActionData();
  const loaderData = useLoaderData();
  const [formData, setFormData] = useState({
    firstName: actionData?.fields?.firstName || loaderData.firstName,
    lastName: actionData?.fields?.lastName || loaderData.lastName,
    gender: actionData?.fields?.gender || loaderData.gender,
    birthday: actionData?.fields?.birthday || loaderData.birthday,
    bio: actionData?.fields?.bio || loaderData.bio,
    city: actionData?.fields?.city || loaderData.city
  });

  const handleInputChange = (event, field) => {
    let value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="relative h-screen w-full lg:ps-64">
      <div className="max-w-4xl px-4 py-10 sm:px-6 lg:px-8 mx-auto">
        <div className="bg-white rounded-xl shadow p-4 sm:p-7 dark:bg-neutral-800">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-200">
              Perfil
            </h2>
            <p className="text-sm text-gray-600 dark:text-neutral-400">
              Administra tu nombre, contraseña y configuración de cuenta.
            </p>
          </div>
          <form method="POST">
            <div className="grid sm:grid-cols-12 gap-2 sm:gap-6">
              <div className="sm:col-span-3">
                <label className="inline-block text-sm text-gray-800 mt-2.5 dark:text-neutral-200">
                  Foto de perfil
                </label>
              </div>
              <div className="sm:col-span-9">
                <div className="flex items-center gap-5">
                  <img className="inline-block size-16 rounded-full ring-2 ring-white dark:ring-neutral-900" src="https://res.cloudinary.com/dug5cohaj/image/upload/v1715526626/dgoztmlvittkhvldpkpr.png" alt="Descripción de la imagen"/>
                  <div className="flex gap-x-2">
                    <div>
                      <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800">
                        <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Subir foto
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="inline-block text-sm text-gray-800 mt-2.5 dark:text-neutral-200">
                  Nombre completo
                </label>
              </div>
              <div className="sm:col-span-9">
                <div className="sm:flex">
                  <input type="text" name="firstName" value={formData.firstName} onChange={e => handleInputChange(e, 'firstName')} className="py-2 px-3 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" placeholder="Nombre"/>
                  <input type="text" name="lastName" value={formData.lastName} onChange={e => handleInputChange(e, 'lastName')} className="py-2 px-3 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" placeholder="Apellido"/>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="inline-block text-sm text-gray-800 mt-2.5 dark:text-neutral-200">
                  Ciudad
                </label>
              </div>
              <div className="sm:col-span-9">
                <select name="city" value={formData.city} onChange={e => handleInputChange(e, 'city')} className="py-2 mt-2 px-3 block w-full border-gray-200 shadow-sm text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
                  <option value="">Seleccione una ciudad</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="inline-block text-sm text-gray-800 mt-2.5 dark:text-neutral-200">
                  Género
                </label>
              </div>
              <div className="sm:col-span-9">
                <div className="sm:flex">
                  <label className="flex py-2 px-3 w-full border border-gray-200 shadow-sm text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
                    <input name="gender" onChange={e => handleInputChange(e, 'gender')} value="hombre" checked={formData.gender === 'hombre'} type="radio" className="shrink-0 mt-0.5 border-gray-300 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-500 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800" />
                    <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Hombre</span>
                  </label>
                  <label className="flex py-2 px-3 w-full border border-gray-200 shadow-sm text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
                    <input name="gender" onChange={e => handleInputChange(e, 'gender')} value="mujer" checked={formData.gender === 'mujer'} type="radio" className="shrink-0 mt-0.5 border-gray-300 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-500 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800" />
                    <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">Mujer</span>
                  </label>
                  <label className="flex py-2 px-3 w-full border border-gray-200 shadow-sm text-sm rounded-lg focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600">
                    <input name="gender" onChange={e => handleInputChange(e, 'gender')} value="noBinario" checked={formData.gender === 'noBinario'} type="radio" className="shrink-0 mt-0.5 border-gray-300 rounded-full text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-500 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800" />
                    <span className="text-sm text-gray-500 ms-3 dark:text-neutral-400">No Binario</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="inline-block text-sm text-gray-800 mt-2.5 dark:text-neutral-200">
                  BIO
                </label>
              </div>
              <div className="sm:col-span-9">
                <textarea name="bio" value={formData.bio} onChange={e => handleInputChange(e, 'bio')} className="py-2 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" rows="6" placeholder="Escribe tu biografía..."></textarea>
              </div>

              <div className="sm:col-span-3">
                <label className="inline-block text-sm text-gray-800 mt-2.5 dark:text-neutral-200">
                  Fecha de Nacimiento
                </label>
              </div>
              <div className="sm:col-span-9">
                <input name="birthday" value={formData.birthday} onChange={e => handleInputChange(e, 'birthday')} aria-label="Fecha" type="date" className="py-2 px-3 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-x-2">
              <button type="submit" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

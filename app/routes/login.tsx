import { useState, useEffect, useRef } from 'react';
import { validateEmail, validatePassword } from '~/utils/validators.server';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node';
import { Link, useActionData, useLoaderData } from '@remix-run/react';
import { Input } from '~/components/Input';
import { Label } from '~/components/Label';
import { cn } from '~/utils/cn';
import { login } from '~/utils/queries.server';
import { requireAuthCookie2, setAuthOnResponse } from '~/utils/auth';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAuthCookie2(request);
  if (user) {
    return redirect('/'); // Redirigir si el usuario ya está autenticado
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return json({ error: `Invalid Form Data`, form: "login" }, { status: 400 });
  }

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(errors).some(Boolean)) {
    return json({ errors, fields: { email, password }, form: "login" }, { status: 400 });
  }

  let userId = await login(email, password);

  if (userId === false) {
    return json({ ok: false, errors: { password: "Invalid credentials" } }, 400);
  }

  let response = redirect("/assistant");
  return setAuthOnResponse(response, userId.toString());
}

export default function Login() {
  const actionData = useActionData();
  const firstLoad = useRef(true);
  let actionResult = useActionData<typeof action>();
  const user = useLoaderData<typeof loader>();

  const [errors, setErrors] = useState(actionData?.errors || {});
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email || '',
    password: actionData?.fields?.password || '',
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData(form => ({ ...form, [field]: event.target.value }));
  }

  useEffect(() => {
    firstLoad.current = false;
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-black p-6 rounded-lg shadow-md text-center">
        <img 
          className="mx-auto mb-4 w-32"
          src="https://res.cloudinary.com/dug5cohaj/image/upload/v1712557871/IMG_5881_1_gvb2zv.png" 
          alt="Logo"
        />
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Ingresa a DAIOFF</h2>
        <p className="text-neutral-600 text-sm mt-2 dark:text-neutral-300">Completa todos los campos.</p>
        <form method="POST" className="mt-4 space-y-4">
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={e => handleInputChange(e, 'email')} 
              placeholder="projectmayhem@fc.com" 
              type="email" 
            />
            {actionResult?.errors?.email && (
              <span id="email-error" className="text-red-500 text-sm">{actionResult.errors.email}</span>
            )}
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password" 
              value={formData.password} 
              onChange={e => handleInputChange(e, 'password')} 
              placeholder="••••••••" 
              type="password" 
            />
            {actionResult?.errors?.password && (
              <span id="password-error" className="text-red-500 text-sm">{actionResult.errors.password}</span>
            )}
          </LabelInputContainer>
          <button
            className="w-full py-2 bg-gradient-to-br from-black to-neutral-600 text-white rounded-md font-medium shadow-md"
            type="submit"
          >
            Ingresar
            <BottomGradient />
          </button>
          <Link to="/register">
            <button
              className="w-full py-2 mt-2 bg-gradient-to-br from-black to-neutral-600 text-white rounded-md font-medium shadow-md"
              type="button"
            >
              Registrarse
              <BottomGradient />
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => (
  <>
    <span className="block absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
    <span className="block absolute inset-x-10 -bottom-px h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 blur-sm" />
  </>
);

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex flex-col space-y-2", className)}>
    {children}
  </div>
);

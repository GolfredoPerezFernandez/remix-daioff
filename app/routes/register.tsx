// login.tsx
import { useState, useEffect, useRef } from 'react'
import { validateEmail, validateName, validatePassword } from '~/utils/validators.server'
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node'
import { Link, useActionData } from '@remix-run/react'

import { Input } from '~/components/Input'
import { Label } from '~/components/Label'
import { cn } from '~/utils/cn'
import {  requireAuthCookie2, setAuthOnResponse } from '~/utils/auth'
import { createAccount } from '~/utils/queries.server'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAuthCookie2(request);
  if (user) {
      // Handle unauthenticated or non-existing user cases
      return redirect('/'); // Or redirect to a login page
  } return null
};

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const email = form.get("email");
    const password = form.get("password");
    let firstName = form.get("firstName");
    let lastName = form.get("lastName");
    console.log("asdasdasd"+firstName)
    console.log("asdasdasd"+lastName)
    console.log("email"+email)

    // If not all data was passed, error
    if ( typeof firstName !== "string" ||
    typeof lastName !== "string"||
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return json({ error: `Invalid Form Data`, form: "register" }, { status: 400 });
    }


    // Validate email & password
    const errors = {
        email: validateEmail(email),
        password: validatePassword(password),
        ...{
            firstName: validateName(firstName as string || ''),
            lastName: validateName(lastName as string || ''),
        } 
    };

    //  If there were any errors, return them
    if (Object.values(errors).some(Boolean))
        return json({ errors, fields: { email, password, firstName, lastName }, form: "register" }, { status: 400 });

    
            firstName = firstName as string
            lastName = lastName as string
            console.log("exitoo registro")
            
  let user = await createAccount(email, password,firstName,lastName);
  return setAuthOnResponse(redirect("/"), user.id.toString());
    
  
}

export default function Register() {
    const actionData = useActionData()
    const firstLoad = useRef(true)
    
    const [errors, setErrors] = useState(actionData?.errors || {})
    const [formError, setFormError] = useState(actionData?.error || '')
    const [formData, setFormData] = useState({
      email: actionData?.fields?.email || '',
      password: actionData?.fields?.password || '',
      firstName: actionData?.fields?.lastName || '',
      lastName: actionData?.fields?.firstName || '',
  })
console.log(actionData)

    // Updates the form data when an input changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
      console.log("event.target.value "+event.target.value )
        setFormData(form => ({ ...form, [field]: event.target.value }))
    }

    useEffect(() => {
        if (!firstLoad.current) {
            setFormError('')
        }
    }, [formData])

    useEffect(() => {
        // We don't want to reset errors on page load because we want to see them
        firstLoad.current = false
    }, [])
    return (
        
            <div style={{ background: 'radial-gradient(circle, #ff0000, #800000)' }}  className="h-[100vh]  justify-center items-center flex flex-col gap-y-4">
                <div className="max-w-md mt-10 w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        REGISTRATE EN DAIOFF
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Completa todos los campos para registrarte.
      </p>
 
      <form method="POST"  className="my-8" >

        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="firstName">Nombre</Label>
            <Input id="firstName" 
               name="firstName"  
                        value={formData.firstName}
                        onChange={e => handleInputChange(e, 'firstName')}
                         placeholder="Tyler" type="text" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastName">Apellido</Label>
            <Input id="lastName" 
          name="lastName"    value={formData.lastName}
                        onChange={e => handleInputChange(e, 'lastName')} placeholder="Durden" type="text" />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Correo Electronico</Label>
          <Input id="email" 
          name="email" 
                        value={formData.email}
                        onChange={e => handleInputChange(e, 'email')} placeholder="projectmayhem@fc.com" type="email" />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password"  name="password"  value={formData.password}
                        onChange={e => handleInputChange(e, 'password')} placeholder="••••••••" type="password" />
        </LabelInputContainer>
       
  <div className="text-xs font-semibold text-center tracking-wide text-red-500 w-full">
                        {formError}
                    </div>
        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Registrarse &rarr;
          <BottomGradient />

      
        </button>
                
        <Link className={""} to={'/login'}>

<button
  className="mt-4  bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
  
>
¿Ya tienes Cuenta? &rarr;
  <BottomGradient />
</button>
</Link>
        
      </form>
    </div>
            </div>
    )
}

const BottomGradient = () => {
    return (
      <>
        <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      </>
    );
  };
   
  const LabelInputContainer = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <div className={cn("flex flex-col space-y-2 w-full", className)}>
        {children}
      </div>
    );
  };
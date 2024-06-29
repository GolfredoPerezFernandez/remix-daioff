import { Link, Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useLocation } from "@remix-run/react";
import { LinksFunction, LoaderFunction } from "@remix-run/server-runtime";
import styles from "./tailwind.css?url";
import { IStaticMethods } from "preline/preline";
import { useEffect, useState } from "react";
import { requireAuthCookie2 } from "./utils/auth";

declare global {
  interface Window {
    HSStaticMethods: IStaticMethods;
  }
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

function PrelineScript() {
  const location = useLocation();

  useEffect(() => {
    import("preline/preline");
  }, []);

  useEffect(() => {
    setTimeout(() => {
      window.HSStaticMethods.autoInit();
    }, 100);
  }, [location.pathname]);

  return null;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireAuthCookie2(request);
  return userId ?? null;
}

function Navbar({ userId, onMenuClick }: { userId: string | null, onMenuClick: () => void }) {
  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 fixed top-0 w-full z-50 lg:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-8 w-8"
                src="https://res.cloudinary.com/dug5cohaj/image/upload/v1712557871/IMG_5881_1_gvb2zv.png"
                alt="Logo"
              />
            </Link>
          </div>
          <div className="flex items-center">
            {userId ? (
              <Link to="/logout" className="hidden lg:block text-gray-700 dark:text-neutral-400 px-3 py-2 rounded-md text-sm font-medium">
              Desconectarse
              </Link>
            ) : (
              <Link to="/login" className="hidden lg:block text-gray-700 dark:text-neutral-400 px-3 py-2 rounded-md text-sm font-medium">
                Ingresar
              </Link>
            )}
            <button onClick={onMenuClick} className="lg:hidden text-gray-700 dark:text-neutral-400 ml-3">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const userId = useLoaderData<typeof loader>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-100 dark:bg-neutral-900">
        <Navbar userId={userId} onMenuClick={handleMenuClick} />
        <div
          id="application-sidebar"
          className={`hs-overlay [--auto-close:lg] hs-overlay-open:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } duration-300 transform fixed top-0 start-0 bottom-0 z-[60] w-64 bg-white border-e border-gray-200 overflow-y-auto lg:block lg:translate-x-0 lg:end-auto lg:bottom-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700`}
        >
          <nav className="hs-accordion-group size-full flex flex-col" data-hs-accordion-always-open>
            <div className="flex items-center justify-between pt-4 pe-4 ps-7">
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  height: 60,
                  width: 60
                }}
              >
                <img
                  alt=""
                  src={"https://res.cloudinary.com/dug5cohaj/image/upload/v1712557871/IMG_5881_1_gvb2zv.png"}
                />
              </Link>
            </div>

            <div className="h-full">
              {userId ? <ul className="space-y-1.5 p-4">
                <li>
                  <Link className="flex items-center gap-x-3 py-2 px-3 text-sm text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300" to="/assistant">
                  Asesor Laboral
                  </Link>
                </li>

                <li>
                  <Link to={"/profile"} className="flex items-center gap-x-3 py-2 px-3 text-sm text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300" >
                    Informacion Personal
                  </Link>
                </li>
                <li>
                  <Link to={"/contractData"} className="flex items-center gap-x-3 py-2 px-3 text-sm text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300" >
                    Datos de Contrato
                  </Link>
                </li>{/* 
                <li>
                  <a className="flex items-center gap-x-3 py-2 px-3 text-sm text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300" href="#">
                    Calendario
                  </a>
                </li> */}
              </ul> : null}
            </div>

            <div className="mt-auto">
              <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
                {userId ? <Link className="flex justify-between items-center gap-x-3 py-2 px-3 text-sm text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300" to="/logout">
                  Desconectarse
                  <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                </Link> : <Link className="flex justify-between items-center gap-x-3 py-2 px-3 text-sm text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300" to="/login">
                  Ingresar
                  <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                </Link>}
              </div>
            </div>
          </nav>
        </div>
        <div className="container mx-auto p-4 mt-16 lg:mt-0">
          {children}
        </div>
        {PrelineScript && <PrelineScript />}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

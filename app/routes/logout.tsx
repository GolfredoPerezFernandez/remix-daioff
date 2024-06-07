import { redirectWithClearedCookie } from "../utils/auth";

export function loader() {
  return redirectWithClearedCookie();
}
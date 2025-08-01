// TODO: will be implemented in the future

import { onAuthenticateUser } from "@/actions/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // This page is dynamic to ensure it always reflects the latest authentication state, no cache data.

const AuthCallbackPage = async () => {

    const auth = await onAuthenticateUser();

    if(auth.status === 200 || auth.status === 201) {
        // Redirect to the home page or any other page after successful authentication
        redirect('/home');
    } else if(auth.status === 403 || auth.status === 500 || auth.status === 400) {
        redirect('/');
    }
}

export default AuthCallbackPage;
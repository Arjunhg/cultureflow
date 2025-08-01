import { onAuthenticateUser } from "@/actions/auth";
import { getAllAssistants } from "@/actions/vapi";
import Header from "@/components/ui/ReusableComponents/LayoutComponents/Header";
import Sidebar from "@/components/ui/ReusableComponents/LayoutComponents/Sidebar";
import { redirect } from "next/navigation";

type Props = {
    children: React.ReactNode;
}

// How this works?
// It only renders once. When the bundle is loaded, it will render the layout. It bundles in and cahces the layout.
// Otherwise it can lead to authentication issues if the layout is not cached.

// What we will do is authenticate user in this layout page, but because this layout page is not re-rendered when it's called again, even if the user signs-out it's still gonna hold same context/data(cache).
// So we will have to put a check on every page that is protected, to check if the user is authenticated or not. (One drawback of this approach).

// Other way to go around this is to create a provider (clerk) and inside that we can use client state like useUser which gives the state of the user.
// Inside provide we can check state and based on that when the state update we can send the user back to the login page.


const Layout = async ({ children }: Props) => {

    const userExists = await onAuthenticateUser();

    if(!userExists.user){
        redirect('/sign-in');
    }

    const assistants = await getAllAssistants();

    return (
        <div className="flex w-full min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
            {/* Sidebar */}
            <Sidebar/>
            <div className="flex flex-col w-full h-screen overflow-auto px-6 scrollbar-hide container mx-auto">
                {/* Header */}
                <Header user={userExists.user} assistants={assistants.data || []}/>
                <div className="flex-1 py-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Layout;
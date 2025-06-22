import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
  return (
    <main className="flex h-screen items-center justify-center">
        <SignUp signInUrl="/sign-in"/>
    </main>
  )
}

export default SignUpPage;
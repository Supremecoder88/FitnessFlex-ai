import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <main className="flex h-screen items-center justify-center">
        <SignIn signUpUrl="/sign-up" />
    </main>
  )
}

export default SignInPage;
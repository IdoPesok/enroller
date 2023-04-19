import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <div className="h-screen w-screen flex justify-center items-center flex-col">
    <SignIn 
      path="/sign-in" 
      routing="path" 
      signUpUrl="/sign-up" 
      appearance={{
        elements: {
          formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-400',
          footerActionLink: 'text-emerald-500',
        }
      }}
    />
  </div>
);

export default SignInPage;
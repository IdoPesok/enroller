import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => (
  <div className="h-screen w-screen flex justify-center items-center">
    <SignUp 
      path="/sign-up" 
      routing="path" 
      signInUrl="/sign-in" 
      appearance={{
        elements: {
          formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-400',
          footerActionLink: 'text-emerald-500',
          colorPrimary: 'bg-emerald-500'
        }
      }}
    />
  </div>
);

export default SignUpPage;
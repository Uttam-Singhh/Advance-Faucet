// "use client";
// import { signIn, signOut, useSession } from "next-auth/react";
// import React from "react";
// import "./styles.css";

// const Login = () => {
//   const { data: session, status } = useSession();
//   console.log(session);

//   if (status === "loading") {
//     return <p>Loading....</p>;
//   }

//   if (status === "authenticated") {
//     return (
//       <>
//         <p>Welcome, {session.user?.name}!</p>
//         <button onClick={() => signOut()}>Logout</button>
//       </>
//     );
//   }

//   return (
//     <div>
//       <button onClick={() => signIn("twitter")}>Login with Twitter</button>
//     </div>
//   );
// };

// export default Login;
"use client";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import "./styles.css"; // Import your CSS file

const Login = () => {
  const { data: session, status } = useSession();
  console.log(session);

  if (status === "loading") {
    return <p>Loading....</p>;
  }

  if (status === "authenticated") {
    return (
      <div className="container">
        <div className="login-container">
          <p>Welcome, {session.user?.name}!</p>
          <button onClick={() => signOut()}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="login-container">
        <button onClick={() => signIn("twitter")}>Sign In with Twitter</button>
      </div>
    </div>
  );
};

export default Login;

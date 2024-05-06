import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Add the button in the top middle */}
      <div
        style={{
          position: "fixed",
          top: "20px", // Adjust this value to move the button up or down
          left: "50%",
          transform: "translateX(-50%)", // This centers the button horizontally
          zIndex: 999, // Ensure the button appears above other content
        }}
      >
        <Link href="http://localhost:3000/login">
          <button>Go to Login</button>
        </Link>
      </div>
      {/* Your other content goes here */}
    </div>
  );
}

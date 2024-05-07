import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Button in the top middle */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999,
        }}
      >
        <Link href="/login">
          <button className="login-button">Go to Login</button>
        </Link>
      </div>

      {/* Your other content goes here */}
    </div>
  );
}

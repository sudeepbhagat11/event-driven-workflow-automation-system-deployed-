// "use client";

// import { Form, Row, Col, Button } from "react-bootstrap";
// import FormContainer from "../../components/FormContainer";
// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { BACKEND_URL } from "../config";
// import axios from "axios";

// const SignUp = () => {
//   const router = useRouter();
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       console.log("Wrong Password");
//       return;
//     }

//     const res = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
//       username: email,
//       password: password,
//       name: username,
//     });

    
//     router.push("/login");
//   };

//   return (
//     <div className="bg-gray-100">
//       <FormContainer>
//         <h1 className="my-4 text-center" style={{ fontFamily: "serif" }}>
//           Sign Up
//         </h1>
//         <Form onSubmit={submitHandler}>
//           <Form.Group controlId="name" className="my-4">
//             <Form.Label style={{ fontFamily: "serif" }}> Enter Name</Form.Label>
//             <Form.Control
//               type="text"
//               placeholder="Enter Name"
//               style={{
//                 background: "transparent",
//                 borderRadius: "20px",
//                 height: "50px",
//                 padding: "15px", // Increased padding
//                 borderWidth: "2px", // Increased border weight
//               }}
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//             />
//           </Form.Group>

//           <Form.Group controlId="email" className="my-4">
//             <Form.Label style={{ fontFamily: "serif" }}>
//               Email Address
//             </Form.Label>
//             <Form.Control
//               type="email"
//               placeholder="Enter Email"
//               style={{
//                 background: "transparent",
//                 borderRadius: "20px",
//                 height: "50px",
//                 padding: "15px", // Increased padding
//                 borderWidth: "2px", // Increased border weight
//               }}
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </Form.Group>

//           <Form.Group controlId="password" className="my-4">
//             <Form.Label style={{ fontFamily: "serif" }}>Password</Form.Label>
//             <Form.Control
//               type="password"
//               placeholder="Enter Password"
//               style={{
//                 background: "transparent",
//                 borderRadius: "20px",
//                 height: "50px",
//                 padding: "15px", // Increased padding
//                 borderWidth: "2px", // Increased border weight
//               }}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </Form.Group>

//           <Form.Group controlId="confirmPassword" className="my-3">
//             <Form.Label style={{ fontFamily: "serif" }}>
//               Confirm Password
//             </Form.Label>
//             <Form.Control
//               type="password"
//               placeholder="Confirm Password"
//               style={{
//                 background: "transparent",
//                 borderRadius: "20px",
//                 height: "50px",
//                 padding: "15px", // Increased padding
//                 borderWidth: "2px", // Increased border weight
//               }}
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//             />
//           </Form.Group>

//           <Form.Group className="text-center mt-4">
//             {/* <Button
//               type="submit"
//               variant="outline-primary"
//               className="mt-4"
//               style={{ width: "140px", borderRadius: "20px", padding: "10px" }}
//             >
//               Sign Up
//             </Button> */}

//             <button className="border-balck  w-fit rounded-xl border-2 bg-black px-4 py-2  text-white transition-all hover:border-black hover:bg-black hover:bg-transparent  hover:text-black/90">
//               Sign Up
//             </button>
//           </Form.Group>
//         </Form>

//         <Row className="py-3 text-center mt-4">
//           <Col style={{ fontFamily: "serif" }}>
//             Already have an account? <Link href="/login">Login</Link>
//           </Col>
//         </Row>
//       </FormContainer>
//     </div>
//   );
// };

// export default SignUp;




"use client";

import { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import FormContainer from "../../components/FormContainer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../config";
import axios from "axios";

const SignUp = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); // Error state

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Reset error before new request

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
        username: email,
        password: password,
        name: username,
      });

      router.push("/login");
    } catch (err) {
      setError("Signup failed. Please check your details and try again.");
    }
  };

  return (
    <div className="bg-gray-100">
      <FormContainer>
        <h1 className="my-4 text-center" style={{ fontFamily: "serif" }}>Sign Up</h1>
        
        {error && <p className="text-red-500 text-center">{error}</p>} {/* Error Message */}

        <Form onSubmit={submitHandler}>
          <Form.Group controlId="name" className="my-4">
            <Form.Label style={{ fontFamily: "serif" }}>Enter Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Name"
              style={{ background: "transparent", borderRadius: "20px", height: "50px", padding: "15px", borderWidth: "2px" }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="email" className="my-4">
            <Form.Label style={{ fontFamily: "serif" }}>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter Email"
              style={{ background: "transparent", borderRadius: "20px", height: "50px", padding: "15px", borderWidth: "2px" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="password" className="my-4">
            <Form.Label style={{ fontFamily: "serif" }}>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter Password"
              style={{ background: "transparent", borderRadius: "20px", height: "50px", padding: "15px", borderWidth: "2px" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="confirmPassword" className="my-3">
            <Form.Label style={{ fontFamily: "serif" }}>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm Password"
              style={{ background: "transparent", borderRadius: "20px", height: "50px", padding: "15px", borderWidth: "2px" }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="text-center mt-4">
            <button className="border-balck w-fit rounded-xl border-2 bg-black px-4 py-2 text-white transition-all hover:border-black hover:bg-black hover:bg-transparent hover:text-black/90">
              Sign Up
            </button>
          </Form.Group>
        </Form>

        <Row className="py-3 text-center mt-4">
          <Col style={{ fontFamily: "serif" }}>
            Already have an account? <Link href="/login">Login</Link>
          </Col>
        </Row>
      </FormContainer>
    </div>
  );
};

export default SignUp;


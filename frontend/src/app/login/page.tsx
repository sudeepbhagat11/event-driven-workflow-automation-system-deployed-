"use client";
import { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import FormContainer from "../../components/FormContainer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../config";
import axios from "axios";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State for error messages

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Reset error state before a new request

    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
        username: email,
        password: password,
      });

      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid email or password");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 text-foreground flex items-center justify-center">
      <FormContainer>
        <h1 className="my-4 text-center" style={{ fontFamily: "serif" }}>
          Log In
        </h1>

        {error && (
          <div className="mb-4 text-center text-red-500 font-semibold">
            {error}
          </div>
        )}

        <Form onSubmit={submitHandler}>
          <Form.Group controlId="email" className="my-4">
            <Form.Label style={{ fontFamily: "serif" }}>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter Email"
              style={{
                background: "transparent",
                borderRadius: "20px",
                height: "50px",
                padding: "15px",
                borderWidth: "2px",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="password" className="my-4">
            <Form.Label style={{ fontFamily: "serif" }}>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter Password"
              style={{
                background: "transparent",
                borderRadius: "20px",
                height: "50px",
                padding: "15px",
                borderWidth: "2px",
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="text-center mt-4">
            <button
              type="submit"
              className="border-black w-fit rounded-xl border-2 bg-black px-4 py-2 text-white transition-all hover:border-black hover:bg-black hover:bg-transparent hover:text-black/90"
            >
              Sign In
            </button>
          </Form.Group>
        </Form>

        <Row className="py-3 text-center mt-4">
          <Col style={{ fontFamily: "serif" }}>
            Not registered? <Link href="/signup">Sign Up</Link>
          </Col>
        </Row>
      </FormContainer>
    </div>
  );
};

export default Login;


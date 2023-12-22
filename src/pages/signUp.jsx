import { useState } from "react";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";

// eslint-disable-next-line react/prop-types
const SignupPage = ({ isOpen }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState("");
  const navigate = useNavigate()

  const handleSignup = async () => {
    const response = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      setMessage("Signup successful!");
      navigate('/login')
    } else {
      setMessage("Signup failed.");
    }
  };

  return (
    <Card isOpen={!isOpen}>
      <div>
        <h1>Signup</h1>
        <Input
          placeholder={'Username'}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
        type={"email"}
          placeholder={'Email'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type={"password"}
          placeholder={"Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleSignup} disabled={!username || !password}>Signup</Button>
        <p>{message}</p>
      </div>
    </Card>
  );
};

export default SignupPage;
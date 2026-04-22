import { useState } from "react";
import { useRouter } from "next/router";
import { signUp } from "@/services/authService";

export default function SignupPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState < string | null > (null);
    const [success, setSuccess] = useState < string | null > (null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (loading) return; // prevent double click

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await signUp({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
            });

            setSuccess("Account created successfully!");

            // redirect to onboarding after short delay
            setTimeout(() => {
                router.push("/onboarding/company");
            }, 1000);
        } catch (err: any) {
            console.error("Signup error:", err);

            if (err.message?.includes("rate limit")) {
                setError("Too many attempts. Please wait a moment and try again.");
            } else if (err.message?.includes("already registered")) {
                setError("Email already registered. Try logging in.");
            } else {
                setError(err.message || "Signup failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Create Your Account</h1>

            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        ...styles.button,
                        opacity: loading ? 0.6 : 1,
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Creating account..." : "Sign Up"}
                </button>

                {error && <p style={styles.error}>{error}</p>}
                {success && <p style={styles.success}>{success}</p>}
            </form>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        maxWidth: 400,
        margin: "80px auto",
        padding: 20,
        border: "1px solid #eee",
        borderRadius: 8,
        textAlign: "center",
    },
    title: {
        marginBottom: 20,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    input: {
        padding: 10,
        borderRadius: 6,
        border: "1px solid #ccc",
    },
    button: {
        padding: 12,
        borderRadius: 6,
        border: "none",
        backgroundColor: "#2563eb",
        color: "#fff",
        fontWeight: "bold",
    },
    error: {
        color: "red",
        marginTop: 10,
    },
    success: {
        color: "green",
        marginTop: 10,
    },
};
import { useState } from "react";
import { Link } from "react-router-dom";
import ycLogo from "../assets/ycLogo copy.avif";
import { supabase } from "../supabase";



export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    // 1. Insert into Supabase
    const { error } = await supabase
      .from("waitlist")
      .insert([{ email }]);

    if (error) {
      if (error.code === "23505") {
        alert("You’re already on the waitlist");
      } else {
        console.error(error);
        alert("Something went wrong");
      }
      return;
    }
    await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });


    // 2. Fire confirmation email (do NOT block UI)
    fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email }),
      }
    ).catch(console.error);

    // 3. Update UI instantly
    setSubmitted(true);
  };





  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-4xl font-semibold tracking-tight">
            <a href="#home">Kord AI</a>
          </h1>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Login
            </Link>
            <a
              href="#waitlist"
              className="text-sm px-5 py-2 rounded-full bg-black text-white hover:opacity-90 transition"
            >
              Join waitlist
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-28 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 id="home" className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
            Meet your AI-powered career shadchan
          </h2>

          <p className="mt-6 text-lg md:text-xl text-gray-600">
            No need to search , wait and apply everytime everywhere.<br /><br />
            Kord works 24/7 collecting data for your Personalized JOB preference.
            <br />
            Personalized. Professional. Relentless.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <a
              href="#waitlist"
              className="px-8 py-3 rounded-full bg-black text-white text-sm hover:opacity-90 transition"
            >
              Join the waitlist
            </a>

            <a
              href="#how"
              className="px-8 py-3 rounded-full border text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="py-32 bg-gray-50 px-6"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-3xl md:text-3xl font-semibold tracking-tight">
            Speed matters.
          </h3>
          The fastest applicants get seen first.<br></br>
          Kord helps you move faster — just swipe the CARDS matched to your skills and act before the crowd arrives.
        </div><br></br><br></br><br></br>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-semibold">
                Real Founder Data & Smart Follow-Ups
              </h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Don't worry , 100's of founders and hiring teams have been scanned by our AI.
                <br />
                Kord tracks responses and enables smarter follow-ups
                so no opportunity slips through.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold">
                Built for clarity, not chaos
              </h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Complex career decisions, simplified.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold">
                See your matches in action
              </h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Swipe to explore startups.
                Right to show interest. Left to move on.
              </p>
            </div>
          </div>

          {/* <div className="relative">
            <div className="rounded-2xl bg-black text-white p-8 shadow-2xl">
              <div className="text-sm text-gray-400 mb-4">
                Upload Resume
              </div>

              <div className="border border-dashed border-gray-600 rounded-xl p-10 text-center">
                <div className="text-3xl mb-3">⬆️</div>
                <p className="text-sm text-gray-400">
                  Drop your resume here
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* CASINO STACK */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center justify-center gap-2 flex-wrap">
            Swipe right on hundreds of high-signal startups —
            <img
              src={ycLogo}
              alt="Y Combinator"
              className="h-8 opacity-90 inline-block"
            />
            and beyond.
          </h3>


          <p className="mt-4 text-gray-600">
            The resume is dead. Long live the match.
          </p>

          <div className="relative mt-20 h-72 flex justify-center items-center">
            <div className="absolute w-80 h-48 rounded-2xl bg-gray-100 border shadow-sm rotate-[-8deg]" />
            <div className="absolute w-80 h-48 rounded-2xl bg-gray-200 border shadow-md rotate-[6deg]" />

            <div className="relative w-80 h-48 rounded-2xl bg-white border shadow-lg flex items-center justify-center">
              <div className="flex items-center justify-between w-full px-10">
                <div className="flex flex-col items-center text-black">
                  <div className="text-3xl animate-pulse">←</div>
                  <span className="text-sm mt-2">Swipe left</span>
                </div>

                <div className="h-10 w-px bg-gray-200" />

                <div className="flex flex-col items-center text-black">
                  <div className="text-3xl animate-pulse">→</div>
                  <span className="text-sm mt-2">Swipe right</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREE VS PREMIUM */}
      <section className="py-32 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-semibold text-center">
            Free vs Premium
          </h3>

          <div className="mt-16 grid md:grid-cols-2 gap-10">
            {/* FREE */}
            <div className="rounded-2xl border bg-white p-8">
              <h4 className="text-lg font-semibold mb-4">
                Free
              </h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>• Limited matches per week</li>
                <li>• Basic startup profiles</li>
                <li>• Manual outreach</li>
                <li>• No founder insights</li>
              </ul>
            </div>

            {/* PREMIUM */}
            <div className="rounded-2xl border bg-black text-white p-8">
              <h4 className="text-lg font-semibold mb-4">
                Premium
              </h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>• Unlimited matches</li>
                <li>• Founder insights & intent signals</li>
                <li>• Smart follow-ups</li>
                <li>• Priority discovery</li>
              </ul>

              <a
                href="#waitlist"
                className="inline-block mt-8 px-6 py-3 rounded-full bg-white text-black text-sm font-medium hover:opacity-90 transition"
              >
                Unlock Premium
              </a>

              <p className="mt-4 text-xs text-gray-400">
                Costs less than your next pizza 🍕
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section
        id="waitlist"
        className="py-32 px-6"
      >
        <div className="max-w-xl mx-auto text-center">
          {!submitted ? (
            <>
              <h3 className="text-3xl font-semibold">
                Join the waitlist
              </h3>

              <p className="mt-4 text-gray-600">
                Early users get priority access to fresher-friendly roles before applications get crowded.

              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-10 space-y-4"
              >
                <input
                  type="email"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />

                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-xl text-sm hover:opacity-90 transition"
                >
                  Request early access
                </button>

                <p className="text-xs text-gray-400">
                  No spam. Cancel anytime.
                </p>
              </form>
            </>
          ) : (
            <div className="py-16">
              <h3 className="text-2xl font-semibold">
                You’re on the list 🎉
              </h3>
              <p className="mt-4 text-gray-600">
                We’ll reach out as soon as Kord opens up.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-green-500/30 bg-green-950/50 px-3 py-1 text-xs font-medium text-green-300 shadow-lg shadow-green-900/50">
            Powered by Supabase
          </div>
        </div>



      </section>

      {/* FOOTER */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Kord AI
      </footer>
    </div>
  );
}

import { useState } from "react"
import NavBar from "./Components/NavBar"
import Home from "./Components/Home"
import About from "./Components/About"
import Plans from "./Components/Plans"
import Informations from "./Components/Informations"
import Categories from "./Components/Categories"
import Footer from "./Components/Footer"
import Shop from "./Components/Shop"
import SignUp from "./Components/SignUp"
import Login from "./Components/Login"
import { Routes, Route, useLocation } from 'react-router-dom'
import SellerMain from "./Seller/SellerMain"
import PublicStorefront from "./Seller/Publicstorefront"
import { LangProvider } from "./Components/Translations"   // ← ADD
import LangToggle from "./Components/LangToggle"           // ← ADD

const LandingPage = ({ onSignUp }: { onSignUp: () => void }) => (
  <div>
    <div id="home"><Home onSignUp={onSignUp} /></div>
    <div id="about"><About /></div>
    <div id="informations"><Informations /></div>
    <div id="niches"><Categories /></div>
    <div id="inspiration"><Shop /></div>
    <div id="plans"><Plans /></div>
  </div>
)

function AppInner() {
  const [showSignUp, setShowSignUp] = useState(false)
  const [showLogin,  setShowLogin]  = useState(false)
  const location = useLocation()

  const isLanding = location.pathname === "/"
  const openSignUp = () => { setShowSignUp(true); setShowLogin(false) }
  const openLogin  = () => { setShowLogin(true);  setShowSignUp(false) }
  const closeAll   = () => { setShowSignUp(false); setShowLogin(false) }

  return (
    <div>
      {/* Landing navbar — only on "/" */}
      {isLanding && <NavBar onSignUp={openSignUp} onLogin={openLogin} />}

      <Routes>
        <Route path="/" element={<LandingPage onSignUp={openSignUp} />} />
        <Route path="/seller/*" element={<SellerMain />} />
        <Route path="/store/:slug" element={<PublicStorefront />} />
      </Routes>

      {/* Footer — only on "/" */}
      {isLanding && (
        <div id="contact"><Footer /></div>
      )}

      {/* Lang toggle — only on landing page */}
      {isLanding && <LangToggle />}

      {/* SignUp Modal */}
      {showSignUp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={closeAll}>
          <div onClick={e => e.stopPropagation()}>
            <SignUp onClose={closeAll} onSwitchToLogin={openLogin} />
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={closeAll}>
          <div onClick={e => e.stopPropagation()}>
            <Login onClose={closeAll} onSwitchToSignUp={openSignUp} />
          </div>
        </div>
      )}
    </div>
  )
}

// LangProvider wraps everything so NavBar + all landing components share language state
function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  )
}

export default App
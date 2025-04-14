import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Chat } from './pages/Chat'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Profile } from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="chat" element={<Chat />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App 
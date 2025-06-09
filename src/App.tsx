import { VotingTools } from './components/VotingTools'
import { VoteDebug } from './components/VoteDebug'

function App() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Design Validate</h1>
      <VotingTools />
      <VoteDebug />
    </div>
  )
}

export default App
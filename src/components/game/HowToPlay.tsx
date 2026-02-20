import { GlassPanel } from '@/components/ui/GlassPanel';

export function HowToPlay() {
  return (
    <section className="w-full max-w-4xl mt-12 mb-16 px-4" aria-labelledby="how-to-play-title">
      <GlassPanel className="border-secondary/20 bg-black/40 backdrop-blur-md p-8 md:p-10">
        <h2
          id="how-to-play-title"
          className="text-3xl md:text-4xl font-marcellus text-secondary text-center mb-8 tracking-widest drop-shadow-sm"
        >
          How to Play Rota
        </h2>

        <div className="grid md:grid-cols-2 gap-8 text-gray-300 font-lora leading-relaxed">

          <article className="space-y-4">
            <h3 className="text-xl font-marcellus text-primary-bright tracking-wide border-b border-white/10 pb-2">
              Objective
            </h3>
            <p>
              Rota is an ancient Roman game of strategy, often called &quot;Roman Tic-Tac-Toe.&quot;
              The goal is simple but challenging: be the first player to arrange your three pieces in a row.
            </p>
            <p>
              Winning lines can be formed along the <strong>outer circle</strong> or across the <strong>center diameter</strong>.
            </p>
          </article>

          <article className="space-y-4">
            <h3 className="text-xl font-marcellus text-primary-bright tracking-wide border-b border-white/10 pb-2">
              The Rules
            </h3>
            <ol className="list-decimal list-inside space-y-2 marker:text-secondary">
              <li>
                <strong className="text-white">Phase 1: Deployment</strong>
                <br />
                Players take turns placing one piece at a time on any empty spot until all 6 pieces are on the board.
              </li>
              <li>
                <strong className="text-white">Phase 2: Movement</strong>
                <br />
                Once all pieces are placed, players take turns sliding one piece to an <strong>adjacent empty spot</strong> along the lines.
              </li>
            </ol>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 mt-2 pl-2 marker:text-secondary/70">
              <li>You cannot jump over pieces.</li>
              <li>You must move if possible.</li>
              <li>If you are blocked, you lose your turn.</li>
            </ul>
          </article>

          <article className="space-y-4">
             <h3 className="text-xl font-marcellus text-primary-bright tracking-wide border-b border-white/10 pb-2">
              Strategy Tips
            </h3>
            <p>
              The center spot (the <em>hub</em>) is powerful because it connects to everything, but it can also be a trap.
              A common tactic is to block your opponent from taking the center early, or to use the outer rim to set up a double threat.
            </p>
          </article>

          <article className="space-y-4">
            <h3 className="text-xl font-marcellus text-primary-bright tracking-wide border-b border-white/10 pb-2">
              History
            </h3>
            <p>
              Historically known as <em>Terni Lapilli</em> (Three Pebbles), Rota wheels have been found carved into the stones of forums, temples, and barracks across the Roman Empire.
              It was a popular pastime for soldiers and citizens alike, requiring nothing more than a scratched wheel and a few stones.
            </p>
          </article>

        </div>
      </GlassPanel>
    </section>
  );
}

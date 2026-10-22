import { FAQ } from "./site";

export function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="border-t">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 id="faq-heading" className="text-3xl font-semibold tracking-tight">
          Questions, answered
        </h2>
        <dl className="mt-10 divide-y rounded-2xl border">
          {FAQ.map((item) => (
            <div key={item.question} className="space-y-2 p-6">
              <dt className="font-medium">{item.question}</dt>
              <dd className="text-muted-foreground text-sm leading-relaxed">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

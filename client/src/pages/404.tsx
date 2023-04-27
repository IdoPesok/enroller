export default function Error404() {
  return (
    <>
      <div className="flex justify-center items-center gap-10 py-20 flex-col">
        <h1 className="font-extrabold text-transparent text-8xl bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600">
          404
        </h1>
        <p>
          You didn&apos;t break the internet, but we can&apos;t find what you
          are looking for.
        </p>
      </div>
    </>
  )
}

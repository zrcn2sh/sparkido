import { SparkForm } from '@/components/spark/SparkForm'

export default function SparkNewPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold">Spark 등록</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        아이디어를 등록하고 실행의 궤적을 남겨 보세요.
      </p>
      <SparkForm />
    </section>
  )
}

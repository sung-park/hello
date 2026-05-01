import { db } from '@/lib/db'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createSkillCategory,
  deleteSkillCategory,
  moveSkillCategory,
  createSkill,
  deleteSkill,
  moveSkill,
} from '@/lib/actions/skill'

export default async function SkillsAdminPage() {
  const session = await auth()
  if (!session) redirect('/admin/login')

  const categories = await db.skillCategory.findMany({
    orderBy: { order: 'asc' },
    include: { skills: { orderBy: { order: 'asc' } } },
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">스킬</h1>
      </div>

      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <form action={createSkillCategory} className="flex gap-2">
          <Input name="name" placeholder="새 카테고리 (예: Languages, Frameworks)" required />
          <Button type="submit">카테고리 추가</Button>
        </form>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
          카테고리가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat, catIdx) => (
            <div key={cat.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <form action={moveSkillCategory.bind(null, cat.id, 'up')}>
                    <button
                      type="submit"
                      disabled={catIdx === 0}
                      className="text-slate-500 hover:text-slate-300 disabled:opacity-30"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </form>
                  <form action={moveSkillCategory.bind(null, cat.id, 'down')}>
                    <button
                      type="submit"
                      disabled={catIdx === categories.length - 1}
                      className="text-slate-500 hover:text-slate-300 disabled:opacity-30"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </form>
                </div>
                <h2 className="flex-1 text-lg font-semibold text-slate-100">
                  {cat.name}
                  {cat.nameEn && <span className="ml-2 text-sm text-slate-400">({cat.nameEn})</span>}
                </h2>
                <form action={deleteSkillCategory.bind(null, cat.id)}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </Button>
                </form>
              </div>

              <div className="mb-3 space-y-2 pl-6">
                {cat.skills.length === 0 ? (
                  <p className="text-sm text-slate-500">스킬이 없습니다.</p>
                ) : (
                  cat.skills.map((skill, sIdx) => (
                    <div
                      key={skill.id}
                      className="flex items-center gap-3 rounded border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
                    >
                      <div className="flex flex-col gap-0.5">
                        <form action={moveSkill.bind(null, skill.id, 'up')}>
                          <button
                            type="submit"
                            disabled={sIdx === 0}
                            className="text-slate-500 hover:text-slate-300 disabled:opacity-30"
                          >
                            <ChevronUp size={12} />
                          </button>
                        </form>
                        <form action={moveSkill.bind(null, skill.id, 'down')}>
                          <button
                            type="submit"
                            disabled={sIdx === cat.skills.length - 1}
                            className="text-slate-500 hover:text-slate-300 disabled:opacity-30"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </form>
                      </div>
                      <div className="flex-1 text-slate-200">{skill.name}</div>
                      {skill.level !== null && (
                        <div className="text-xs text-slate-400">Lv {skill.level}</div>
                      )}
                      {skill.years !== null && (
                        <div className="text-xs text-slate-400">{skill.years}y</div>
                      )}
                      <form action={deleteSkill.bind(null, skill.id)}>
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </form>
                    </div>
                  ))
                )}
              </div>

              <form action={createSkill.bind(null, cat.id)} className="flex gap-2 pl-6">
                <Input name="name" placeholder="스킬명" required className="flex-1" />
                <Input
                  name="level"
                  type="number"
                  min={1}
                  max={5}
                  placeholder="레벨 1-5 (선택)"
                  className="w-32"
                />
                <Input
                  name="years"
                  type="number"
                  min={0}
                  placeholder="년수 (선택)"
                  className="w-32"
                />
                <Button type="submit">스킬 추가</Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { getPigEnabled, setPigEnabled } from '@/lib/actions/lab'

export default async function LabPage() {
  const pigEnabled = await getPigEnabled()

  async function toggle() {
    'use server'
    await setPigEnabled(!pigEnabled)
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-slate-100">실험실</h1>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-100">마인크래프트 돼지 캐릭터</div>
            <div className="mt-1 text-xs text-slate-400">
              포트폴리오 좌측 하단에 마우스를 따라 고개를 돌리는 돼지가 나타납니다.
            </div>
          </div>
          <form action={toggle}>
            <button
              type="submit"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pigEnabled
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              {pigEnabled ? '끄기' : '켜기'}
            </button>
          </form>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${pigEnabled ? 'bg-green-400' : 'bg-slate-600'}`}
          />
          <span className="text-xs text-slate-400">{pigEnabled ? '활성화됨' : '비활성화됨'}</span>
        </div>
      </div>
    </div>
  )
}

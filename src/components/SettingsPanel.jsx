import ToggleSwitch from "./ToggleSwitch";
import { useI18n } from "../i18n";

export default function SettingsPanel({
  settings,
  onChangeSettings,
}) {
  const { t } = useI18n();

  const s = settings;

  const onNumChange = (key) => (e) => {
    const v = Number(e.target.value);
    onChangeSettings({ [key]: Number.isFinite(v) ? v : s[key] });
  };

  return (
    <div className="p-3 flex flex-col gap-4 text-sm">

      <section className="space-y-2">
        <div className="font-semibold text-slate-600 mb-1">
          {t("settings.problem.title")}
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col">
            <span>- {t("settings.randomSize")}</span>
            <ToggleSwitch
              checked={s.randomSize}
              onChange={(on) => onChangeSettings({ randomSize: on })}
              label={
                s.randomSize
                  ? "- " + t("settings.randomSize.on")
                  : "- " + t("settings.randomSize.off")
              }
            />
          </div>

          {!s.randomSize && (
            <>
              <div className="flex flex-col">
                <span>{t("settings.rows")}</span>
                <input
                  type="number"
                  className="mt-1 w-20 px-2 py-1 border rounded"
                  min={1}
                  max={8}
                  value={s.rows}
                  onChange={onNumChange("rows")}
                />
              </div>
              <div className="flex flex-col">
                <span>{t("settings.cols")}</span>
                <input
                  type="number"
                  className="mt-1 w-20 px-2 py-1 border rounded"
                  min={1}
                  max={8}
                  value={s.cols}
                  onChange={onNumChange("cols")}
                />
              </div>
            </>
          )}

          {s.randomSize && (
            <>
              <div className="flex flex-col">
                <span>{t("settings.rowsRange")}</span>
                <div className="mt-1 flex items-center gap-1">
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border rounded"
                    min={1}
                    max={8}
                    value={s.minRows}
                    onChange={onNumChange("minRows")}
                  />
                  <span>〜</span>
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border rounded"
                    min={1}
                    max={8}
                    value={s.maxRows}
                    onChange={onNumChange("maxRows")}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span>{t("settings.colsRange")}</span>
                <div className="mt-1 flex items-center gap-1">
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border rounded"
                    min={1}
                    max={8}
                    value={s.minCols}
                    onChange={onNumChange("minCols")}
                  />
                  <span>〜</span>
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border rounded"
                    min={1}
                    max={8}
                    value={s.maxCols}
                    onChange={onNumChange("maxCols")}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <span>- {t("settings.range")}</span>
          <div className="flex flex-col">
            <span>{t("settings.rangeMin")}</span>
            <input
              type="number"
              className="mt-1 w-24 px-2 py-1 border rounded"
              value={s.min}
              onChange={onNumChange("min")}
            />
          </div>
          <div className="flex flex-col">
            <span>{t("settings.rangeMax")}</span>
            <input
              type="number"
              className="mt-1 w-24 px-2 py-1 border rounded"
              value={s.max}
              onChange={onNumChange("max")}
            />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <div className="font-semibold text-slate-600 mb-1">
          {t("settings.display.title")}
        </div>

        <div className="flex items-center gap-3">
          <span>- {t("settings.highlightRows")}:</span>
          <span className="text-slate-500">
            {settings.highlightChangedRows ? "ON" : "OFF"}
          </span>
          <ToggleSwitch
            checked={settings.highlightChangedRows}
            onChange={(on) =>
              onChangeSettings({ ...settings, highlightChangedRows: on })
            }
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-700">
            - {t("settings.showRank") ?? "階数 rank を表示"}:
          </span>
          <span className="text-slate-500">
            {settings.showRank ? "ON" : "OFF"}
          </span>
          <ToggleSwitch
            checked={settings.showRank}
            onChange={(on) =>
              onChangeSettings({ ...settings, showRank: on })
            }
          />
        </div>

      </section>
    </div>
  );
}

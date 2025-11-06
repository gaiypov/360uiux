# 📝 Инструкция по созданию Pull Request

## Способ 1: Через веб-интерфейс GitHub (Рекомендуется)

1. **Перейдите в ваш GitHub репозиторий:**
   ```
   https://github.com/gaiypov/360uiux
   ```

2. **Нажмите на вкладку "Pull requests"**

3. **Нажмите зелёную кнопку "New pull request"**

4. **Выберите ветки:**
   - Base: `main` (или `master` - основная ветка вашего репозитория)
   - Compare: `claude/revolut-ultra-job-app-011CUoibKxNjRkXdDTh4rhTp`

5. **Заполните информацию о PR:**
   - **Title:** `feat: Video Messages & Rich Notifications Integration`
   - **Description:** Скопируйте содержимое файла `PR_DESCRIPTION.md`

6. **Нажмите "Create pull request"**

---

## Способ 2: Через GitHub CLI (если доступен)

```bash
gh pr create \
  --title "feat: Video Messages & Rich Notifications Integration" \
  --body-file PR_DESCRIPTION.md \
  --base main
```

---

## Способ 3: Прямая ссылка для создания PR

Перейдите по ссылке:
```
https://github.com/gaiypov/360uiux/compare/main...claude/revolut-ultra-job-app-011CUoibKxNjRkXdDTh4rhTp?expand=1
```

Затем:
1. Введите title: `feat: Video Messages & Rich Notifications Integration`
2. Скопируйте описание из файла `PR_DESCRIPTION.md`
3. Нажмите "Create pull request"

---

## 📊 Информация о ветке

- **Текущая ветка:** `claude/revolut-ultra-job-app-011CUoibKxNjRkXdDTh4rhTp`
- **Коммиты для PR:**
  - `f05cb2f` - Video messages integration
  - `4218f57` - Rich notifications
- **Изменений:** 2,256+ строк в 7 файлах

---

## ✅ После создания PR

1. **Добавьте reviewers** - назначьте коллег для ревью
2. **Добавьте labels:**
   - `feature`
   - `enhancement`
   - `video`
   - `notifications`
3. **Добавьте в Project** (если используете GitHub Projects)
4. **Свяжите с Issues** (если есть связанные задачи)

---

## 🔍 Что будет в PR

### Компоненты:
- ✅ ResumeVideoPlayer (479 строк)
- ✅ Video tracking API
- ✅ WebSocket video events
- ✅ Rich notifications service
- ✅ Notification actions
- ✅ Chat store integration

### Функциональность:
- ✅ Video messages с 2-view limit
- ✅ Auto-delete после просмотров
- ✅ Quick reply из уведомлений
- ✅ Mark as read из уведомлений
- ✅ Кастомные звуки уведомлений
- ✅ Badge count management

---

Описание PR готово в файле: **PR_DESCRIPTION.md** ✅

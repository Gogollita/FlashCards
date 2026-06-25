using FlashCards.Server.Models;
using FlashCards.Server.Services;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

builder.Services.AddSingleton<UserRepository>();

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error/exception");
}

app.UseStatusCodePagesWithReExecute("/error/status/{0}");

app.MapGet("/error/exception", () => Results.Problem("Внутренняя ошибка сервера", statusCode: 500));
app.MapGet("/error/status/{code:int}", (int code) =>
{
    string message = code switch
    {
        400 => "Некорректный запрос",
        401 => "Не авторизован",
        403 => "Доступ запрещён",
        404 => "Ресурс не найден",
        409 => "Конфликт (логин уже занят)",
        _ => "Ошибка HTTP"
    };
    return Results.Text($"{code}: {message}");
});

app.MapPost("/register", async (RegisterRequest request, UserRepository repo) =>
{
    if (string.IsNullOrWhiteSpace(request.Login) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.Username))
        return Results.BadRequest(new { error = "Все поля (login, password, username) обязательны" });

    if (repo.UserExists(request.Login))
        return Results.Conflict(new { error = "Пользователь с таким логином уже существует" });

    var newUser = new UserData
    {
        Login = request.Login,
        Password = request.Password,
        Username = request.Username,
        TotalSecondsSpent = 0,
        StarsCurrency = 0,
        CurrentAvatarId = "monkey",
        PurchasedAvatarIds = new List<string> { "monkey" },
        ProfileProgress = new Dictionary<string, LevelProgress>
        {
            ["1"] = new LevelProgress { HighestStars = 0, LearnedWordsCount = 0, IsCompleted = false, IsLocked = false },
            ["2"] = new LevelProgress { HighestStars = 0, LearnedWordsCount = 0, IsCompleted = false, IsLocked = true },
            ["3"] = new LevelProgress { HighestStars = 0, LearnedWordsCount = 0, IsCompleted = false, IsLocked = true },
            ["4"] = new LevelProgress { HighestStars = 0, LearnedWordsCount = 0, IsCompleted = false, IsLocked = true },
            ["5"] = new LevelProgress { HighestStars = 0, LearnedWordsCount = 0, IsCompleted = false, IsLocked = true }
        },
        FavoriteWordIds = new List<string>(),
        TranslationDirection = "ru-en",
        CustomDecks = new Dictionary<string, CustomDeck>()
    };

    repo.AddUser(newUser);
    return Results.Created($"/user/{newUser.Login}", new
    {
        newUser.Login,
        newUser.Username,
        newUser.StarsCurrency,
        newUser.HasSeenTutorial,
        newUser.CurrentAvatarId,
        newUser.PurchasedAvatarIds,
        newUser.ProfileProgress,
        newUser.FavoriteWordIds,
        newUser.CustomDecks,
        newUser.TranslationDirection,
        newUser.TotalSecondsSpent,
        newUser.ActiveSession
    });
});

app.MapPost("/login", (LoginRequest request, UserRepository repo) =>
{
    if (string.IsNullOrWhiteSpace(request.Login) || string.IsNullOrWhiteSpace(request.Password))
        return Results.BadRequest(new { error = "Логин и пароль обязательны" });

    var user = repo.GetUser(request.Login);
    if (user == null || user.Password != request.Password)
        return Results.Unauthorized();

    return Results.Ok(new
    {
        user.Login,
        user.Username,
        user.StarsCurrency,
        user.HasSeenTutorial,
        user.CurrentAvatarId,
        user.PurchasedAvatarIds,
        user.ProfileProgress,
        user.FavoriteWordIds,
        user.CustomDecks,
        user.TranslationDirection,
        user.TotalSecondsSpent,
        user.ActiveSession
    });
});

app.MapGet("/user/{login}", (string login, UserRepository repo) =>
{
    var user = repo.GetUser(login);
    if (user == null)
        return Results.NotFound(new { error = "Пользователь не найден" });

    return Results.Ok(new
    {
        user.Login,
        user.Username,
        user.StarsCurrency,
        user.HasSeenTutorial,
        user.CurrentAvatarId,
        user.PurchasedAvatarIds,
        user.ProfileProgress,
        user.FavoriteWordIds,
        user.CustomDecks,
        user.TranslationDirection,
        user.TotalSecondsSpent,
        user.ActiveSession
    });
});

app.MapPut("/user", (UserData updatedUser, UserRepository repo) =>
{
    if (string.IsNullOrWhiteSpace(updatedUser.Login))
        return Results.BadRequest(new { error = "Логин обязателен" });

    var existing = repo.GetUser(updatedUser.Login);
    if (existing == null)
        return Results.NotFound(new { error = "Пользователь не найден" });

    if (!string.IsNullOrWhiteSpace(updatedUser.Password))
        existing.Password = updatedUser.Password;

    existing.Username = updatedUser.Username;
    existing.TotalSecondsSpent = updatedUser.TotalSecondsSpent;
    existing.StarsCurrency = updatedUser.StarsCurrency;
    existing.HasSeenTutorial = updatedUser.HasSeenTutorial;
    existing.CurrentAvatarId = updatedUser.CurrentAvatarId;
    existing.PurchasedAvatarIds = updatedUser.PurchasedAvatarIds;
    existing.ProfileProgress = updatedUser.ProfileProgress;
    existing.FavoriteWordIds = updatedUser.FavoriteWordIds;
    existing.TranslationDirection = updatedUser.TranslationDirection;
    existing.CustomDecks = updatedUser.CustomDecks;
    existing.ActiveSession = updatedUser.ActiveSession;

    repo.UpdateUser(existing);
    return Results.Ok(new { message = "Данные обновлены" });
});

app.MapGet("/", () => Results.Text("FlashCards Server is running!"));

app.Run();
using System.Text.Json.Serialization;

namespace FlashCards.Server.Models;

public class UserData
{
    public string Login { get; set; } = "";
    public string Password { get; set; } = "";
    public string Username { get; set; } = "";
    public int TotalSecondsSpent { get; set; } = 0;
    public int StarsCurrency { get; set; } = 0;
    public bool HasSeenTutorial { get; set; } = false;
    public string CurrentAvatarId { get; set; } = "monkey";
    public List<string> PurchasedAvatarIds { get; set; } = new() { "monkey" };
    public Dictionary<string, LevelProgress> ProfileProgress { get; set; } = new();
    public List<string> FavoriteWordIds { get; set; } = new();
    public string TranslationDirection { get; set; } = "ru-en";
    public Dictionary<string, CustomDeck> CustomDecks { get; set; } = new();
    public ActiveSessionData ActiveSession { get; set; } = new();
}

public class ActiveSessionData
{
    public string? LevelId { get; set; } = null;
    public int CardIndex { get; set; } = 0;
    public List<int> KnownWords { get; set; } = new();
}

public class LevelProgress
{
    public int HighestStars { get; set; } = 0;
    public int LearnedWordsCount { get; set; } = 0;
    public bool IsCompleted { get; set; } = false;
    public bool IsLocked { get; set; } = true;
}

public class CustomDeck
{
    public string Title { get; set; } = "";
    public List<Card> Cards { get; set; } = new();
}

public class Card
{
	//сериализация для правильного получения значений в js (т.к. модель ожидает поля с заглавных букв)
    [JsonPropertyName("id")] //JsonPropertyName - атрибут, как раз-таки нужный для указания правильного наименования
    public string Id { get; set; } = "";

    [JsonPropertyName("ru")]
    public string Ru { get; set; } = "";

    [JsonPropertyName("en")]
    public string En { get; set; } = "";

    [JsonPropertyName("img")]
    public string Img { get; set; } = "";
}
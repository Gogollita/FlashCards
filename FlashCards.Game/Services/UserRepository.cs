using System.Text.Json;
using FlashCards.Server.Models;

namespace FlashCards.Server.Services;

public class UserRepository
{
    private readonly string _filePath = "users.json";
    private readonly JsonSerializerOptions _options = new() { WriteIndented = true };
    private Dictionary<string, UserData> _users = new();

    public UserRepository()
    {
        Load();
    }

    private void Load()
    {
        if (File.Exists(_filePath))
        {
            var json = File.ReadAllText(_filePath);
            _users = JsonSerializer.Deserialize<Dictionary<string, UserData>>(json, _options) ?? new();
        }
        else
        {
            _users = new();
            Save();
        }
    }

    private void Save()
    {
        var json = JsonSerializer.Serialize(_users, _options);
        File.WriteAllText(_filePath, json);
    }

    public UserData? GetUser(string login)
    {
        _users.TryGetValue(login, out var user);
        return user;
    }

    public bool UserExists(string login) => _users.ContainsKey(login);

    public void AddUser(UserData user)
    {
        _users[user.Login] = user;
        Save();
    }

    public void UpdateUser(UserData user)
    {
        if (_users.ContainsKey(user.Login))
        {
            _users[user.Login] = user;
            Save();
        }
    }
}
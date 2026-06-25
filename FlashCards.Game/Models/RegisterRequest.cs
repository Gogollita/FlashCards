namespace FlashCards.Server.Models;

public class RegisterRequest
{
    public string Login { get; set; } = "";
    public string Password { get; set; } = "";
    public string Username { get; set; } = "";
}
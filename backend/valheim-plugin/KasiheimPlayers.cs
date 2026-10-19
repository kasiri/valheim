using System;
using System.IO;
using System.Linq;
using System.Text;
using BepInEx;
using BepInEx.Configuration;
using UnityEngine;

namespace KasiheimPlayers;

[BepInPlugin("site.kasiheim.playerlist", "Kasiheim Players", "1.0.0")]
public sealed class KasiheimPlayersPlugin : BaseUnityPlugin
{
    private const float SnapshotIntervalSeconds = 5f;
    private ConfigEntry<string> _outputFile = null!;
    private float _elapsedSeconds;

    private void Awake()
    {
        _outputFile = Config.Bind(
            "General",
            "OutputFile",
            "/home/amp/valheim-stats/server_players.json",
            "Local JSON file containing the current connected player names."
        );
        Logger.LogInfo($"Player snapshot output: {_outputFile.Value}");
    }

    private void Update()
    {
        _elapsedSeconds += Time.unscaledDeltaTime;
        if (_elapsedSeconds < SnapshotIntervalSeconds)
            return;

        _elapsedSeconds = 0f;
        WritePlayerSnapshot();
    }

    private void WritePlayerSnapshot()
    {
        if (ZNet.instance == null || !ZNet.instance.IsServer())
            return;

        try
        {
            var players = ZNet.instance.GetPeers()
                .Select(peer => peer.m_playerName)
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Select(name => name.Trim())
                .ToArray();
            var outputFile = _outputFile.Value;
            var directory = Path.GetDirectoryName(outputFile);
            if (string.IsNullOrWhiteSpace(directory))
                throw new InvalidOperationException("OutputFile must include a directory.");

            Directory.CreateDirectory(directory);
            var temporaryFile = outputFile + ".tmp";
            File.WriteAllText(temporaryFile, CreateSnapshotJson(players), new UTF8Encoding(false));
            if (File.Exists(outputFile))
                File.Replace(temporaryFile, outputFile, null);
            else
                File.Move(temporaryFile, outputFile);
        }
        catch (IOException error)
        {
            Logger.LogError($"Failed to write the player snapshot: {error}");
        }
        catch (UnauthorizedAccessException error)
        {
            Logger.LogError($"Permission denied while writing the player snapshot: {error}");
        }
        catch (ArgumentException error)
        {
            Logger.LogError($"The player snapshot path is invalid: {error}");
        }
        catch (InvalidOperationException error)
        {
            Logger.LogError($"Failed to write the player snapshot: {error}");
        }
        catch (NotSupportedException error)
        {
            Logger.LogError($"The player snapshot path is not supported: {error}");
        }
    }

    private static string CreateSnapshotJson(string[] players)
    {
        var builder = new StringBuilder();
        builder.Append("{\"updated_at\":\"");
        builder.Append(DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'"));
        builder.Append("\",\"players\":[");
        for (var index = 0; index < players.Length; index++)
        {
            if (index > 0)
                builder.Append(',');
            AppendJsonString(builder, players[index]);
        }

        builder.Append("]}");
        return builder.ToString();
    }

    private static void AppendJsonString(StringBuilder builder, string value)
    {
        builder.Append('"');
        foreach (var character in value)
        {
            switch (character)
            {
                case '"':
                    builder.Append("\\\"");
                    break;
                case '\\':
                    builder.Append("\\\\");
                    break;
                case '\b':
                    builder.Append("\\b");
                    break;
                case '\f':
                    builder.Append("\\f");
                    break;
                case '\n':
                    builder.Append("\\n");
                    break;
                case '\r':
                    builder.Append("\\r");
                    break;
                case '\t':
                    builder.Append("\\t");
                    break;
                default:
                    if (character < 0x20)
                        builder.Append("\\u").Append(((int)character).ToString("x4"));
                    else
                        builder.Append(character);
                    break;
            }
        }

        builder.Append('"');
    }
}

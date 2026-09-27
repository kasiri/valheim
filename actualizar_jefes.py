import json
import os
import subprocess

JSON_FILE = "bosses.json"

def cargar_bosses():
    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "eikthyr": False,
        "el_sabio": False,
        "bonemass": False,
        "moder": False,
        "yagluth": False,
        "la_reina": False
    }

def guardar_bosses(data):
    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def main():
    bosses = cargar_bosses()
    print("\n--- GESTOR DE JEFES DE KASIHEIM ---")
    print("Actualiza el estado de los jefes (s/n):\n")

    for boss_id in bosses:
        actual = "DERROTADO (True)" if bosses[boss_id] else "PENDIENTE (False)"
        resp = input(f"¿Está derrotado {boss_id.upper()}? [{actual}] (s/n / enter para dejar igual): ").strip().lower()
        
        if resp == 's':
            bosses[boss_id] = True
        elif resp == 'n':
            bosses[boss_id] = False

    guardar_bosses(bosses)
    print("\n[+] bosses.json actualizado localmente.")

    subir = input("¿Subir cambios a GitHub para actualizar Netlify ahora? (s/n): ").strip().lower()
    if subir == 's':
        try:
            subprocess.run(["git", "add", "bosses.json"], check=True)
            subprocess.run(["git", "commit", "-m", "Actualización automática de jefes del clan Kasiheim"], check=True)
            subprocess.run(["git", "push"], check=True)
            print("[+] ¡Enviado a GitHub con éxito! Netlify refrescará la web en unos segundos.")
        except Exception as e:
            print(f"[-] Error al sincronizar con Git: {e}")

if __name__ == "__main__":
    main()
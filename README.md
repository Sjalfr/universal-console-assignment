
# Virtual Space Command Console  
## Projektové zadání (SŠ IT)

---

## 1. Téma

**Fleet Manager**
Ovládate z mateřský vesmirný lodě terminal pomocí, kterého můžete posílat lodě na exkurze, skenovat nebezpečí, vylepšovat komponenty a měnit lokace posádky.

## 2. Cíl projektu

Vytvořit webovou aplikaci, která obsahuje:

- textový terminál s vlastní sadou příkazů,
- animační smyčku (svět běží i bez zásahu uživatele),
- dokumentaci a týmovou spolupráci na GitHubu.

Projekt je realizován **týmově ve třech**.


## 3. Rozdělení rolí v týmu

### a) Terminál / parser **(Tadyáš Chwalek)**
- zpracování vstupu
- historie příkazů
- validace

### b) Simulace světa **(Tomáš Maršál)**
- zpracování objektů
- fyzika / pohyb
- animační smyčka

### c) UI / design **(Josef Michalec)**
- vzhled aplikace
- barvy, fonty, zvuky
- animace

Role se mohou v průběhu projektu střídat.


## 4. Ukázka terminálových příkazů

### Základní
```
help
clear
```

### Prostředí
```
background
alert_sound
```

### Objekty
```
mothership_status
ship_status (name)
```

### Řízení simulace
```
next_day
freeze
resume
speed
```

Každý příkaz:
- mění stav simulace,
- vrací textovou odpověď.


## 5. Technologie

- HTML, CSS
- JavaScript
- Web Audio
- SVG
- JSON


## 6. Časová osa projektu (2 hodiny týdně)

| Týden | Obsah |
|------|--------|
| 1 | Zadání, návrh, GitHub |
| 2 | Skeleton aplikace |
| 3 | Běžící svět |
| 4 | Základní příkazy |
| 5 | Stav systému |
| 6 | UI / efekty |
| 7 | Dokumentace |
| 8 | Testování |
| 9–10 | Prezentace |

Celkem cca 20 hodin ve škole + domácí práce.


## 7. Povinné technické požadavky

Projekt musí obsahovat:

- vlastní terminál,
- parser příkazů,
- animační smyčku,
- minimálně 8 příkazů,
- oddělení logiky a vizualizace,
- veřejný GitHub repozitář.




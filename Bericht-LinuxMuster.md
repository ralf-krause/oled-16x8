# DebianEdu Client f=C3=BCr LinuxMuster=0A=0ADer urspr=C3=BCngliche =
Auftrag umfasste die Entwicklung eines LinuxMuster Clients auf Basis von =
DebianEdu.=0ADazu wurde zun=C3=A4chst eine virtualisierte Testumgebung =
aufgesetzt, auf der sowohl der LinuxMuster 7.1 Server als auch einige =
LinuxMuster Client-Installationen getestet werden sollten.=0ABereits bei =
der Installation des Servers kam es zu Problemen beim grafischen Installati=
onsprozess, die jedoch durch eine alternative Installationsmethode noch =
umgangen werden konnten.=0ADie Installation eines Muster-Clients =C3=BCber =
PXE gestaltete sich jedoch aufgrund weiterer Fehler in der Installationsumg=
ebung trotz erheblichen Aufwands bei der Fehlersuche als unm=C3=B6glich.=0A=
Ein entsprechender Fehlerbericht wurde wegen vorgeblich fehlender =
Reproduzierbarkeit geschlossen, auf erneutes Feedback Anfang diesen Jahre =
erfolgte keine weitere Antwort.=0A=0A=0A## LinuxMuster Server 7.1=0A=0ALinu=
xMuster 7.1 Server verwendet Ubuntu 18.04 als Grundlage. F=C3=BCr diese =
Version von Ubuntu wurde der kostenlose Standard-Supoort am 31. Mai 2023 =
[eingestellt][1], um im Rahmen des Extended Security Maintenance (ESM) die =
f=C3=BCr den Produktiveinsatz n=C3=B6tigen Sicherheitsupdates zu erhalten, =
ist ein kostenpflichtiges Abonnement f=C3=BCr [Ubuntu Pro notwendig][2].=0A=
Erst die Version 7.2 wird [auf Ubuntu 22.04 umsteigen][3], allerdings =
befindet sich diese zur Zeit noch im [Beta-Stadium][4] und ist von den =
Entwicklern ausdr=C3=BCcklich =E2=80=9Enicht f=C3=BCr den produktiven =
Einsatz freigegeben=E2=80=9C[^1].=0A=0ADie Installation des Servers =
erfolgt in drei Schritten, zun=C3=A4chst wird Ubuntu nach bestimmten =
Vorgaben auf dem Zielsystem installiert.=0ADanach m=C3=BCssen zun=C3=A4chst=
 eine [Basis-Konfiguration][4] und [Installationsvorbereitung][5] =
vorgenommen werden, beides ist im wesentliche eine lange Abfolge von =
Kommandos, die von Nutzer jeweils abgetippt und ggf. angepasst werden =
m=C3=BCssen, sowie Instruktionen Konfigurationsdateien zu editieren.=0ADie =
Ausf=C3=BChrung des Skripts `lmn-prepare` im nicht-interaktiven Modus (mit =
der Option `-u`) schlug zun=C3=A4chst fehl, weil `pvcreate` versucht den =
Benutzer zu fragen, ob gefundene Signaturen =C3=BCberschrieben werden =
sollen. F=C3=BCr einen nicht-interaktiven Aufruf w=C3=A4re ein Aufruf von =
`pvcreate -y` n=C3=B6tig. Dies musste zum erfolgreichen Beenden des =
Skripts erst behoben werden.=0A=0ADie manuelle Konfiguration des Zielsystem=
s ist sowohl zeitaufw=C3=A4ndig als auch fehleranf=C3=A4llig, zu m=C3=B6gli=
chen Fehlern beim Abtippen kommen noch fehlerhafte Kommandos in der =
Dokumentation hinzu[^2].=0AZudem ist Konfiguration damit auch nicht =
reproduzierbar und das Skript `lmn-prepare` ist nicht idempotent.=0AFehler =
k=C3=B6nnen im Nachhinein schwer feststellbar und schwer zu beheben =
sein.=0AVergleichbare Systeme wie z.B. DebianEdu vermeiden diese Probleme =
durch eine Kombination von Installationsskripten, Paket-Skripten, =
Konfigurationsmanagement und der Verwendung von Versionskontrollsystemen =
f=C3=BCr Konfigurationsdateien, so dass Installationen halb- oder voll =
automatisiert und reproduzierbar durchgef=C3=BChrt werden k=C3=B6nnen.=0A=
=0ASchlie=C3=9Flich gibt es f=C3=BCr das Aufsetzen des Servers zwei =
M=C3=B6glichkeiten, zum einen =C3=BCber die Weboberfl=C3=A4che =E2=80=9ESch=
ulkonsole=E2=80=9C und zum anderen in der Konsole.=0AErsteres erfordert =
das Einloggen auf der Weboberfl=C3=A4che von einem externen Rechner, um =
danach eine Reihe von Fragen zu beantworten und den Server entsprechend zu =
konfigurieren. Dies war jedoch nicht m=C3=B6glich, nach Eingabe von =
Benutzernamen und Passwort reagiert der Server nicht mehr, alle weiteren =
Anfragen f=C3=BChren zu einem Timeout.=0ANach einer Fehlersuche lie=C3=9F =
sich dies auf eine unbehandelte Ausnahme zur=C3=BCckf=C3=BChren, die von =
einem Fehler beim Aufruf von `samba-tool` herr=C3=BChrt.=0AIm Support-Forum=
 finden sich zahlreiche Berichte =C3=BCber dieses Problem[^3], jedoch ohne =
eine L=C3=B6sung.=0A=0AEin Ausf=C3=BChren der alternativen Setup-Skripts =
`linuxmuster-setup` an der Konsole im nicht-interaktiven Modus (mit der =
Option `--unattended`) verlief nicht korrekt[^4], es wurde trotz Angabe =
eines Passworts mit der `--adminpw=3D` Option interaktiv nach einem =
Passwort gefragt, der Setup-Prozess konnte jedoch nach der Eingabe des =
Passworts erfolgreich abgeschlossen werden.=0A=0A## LinuxMuster Client =
7.1=0A=0AUm LinuxMuster Clients zu installieren wird zun=C3=A4chst auf dem =
Server eine entsprechende Hardwareklasse angelegt und konfiguriert und ein =
Client aufgenommen, auf dem der Muster-Client installiert werden soll.=0ADa=
nn wird dieser zur Partitionierung mit der Linux-basierten Imaging-System =
LINBO 4.0.44 via PXE gebootet, ein Betriebssystem installiert und im =
Anschluss mit Hilfe von LINBO den Inhalt der Festplatte auf den Server =
=C3=BCbertr=C3=A4gt, der daraus ein Erstimage erstellt.=0AWeitere Clients =
k=C3=B6nnen dann wieder mit LINBO dieses Image installieren.=0A=0AZur =
Daten=C3=BCbertragung l=C3=A4uft auf dem LinuxMuster Server ein rsync-Diens=
t auf Port 873/tcp. Dieser Dienst wird sowohl zur Auslieferung von Dateien =
an die LINBO-Umgebung als auch zum Transfer des Images auf den Server =
verwendet. Da daf=C3=BCr keinerlei Transportverschl=C3=BCsselung verf=C3=BC=
gbar ist, besteht hier das Risiko eines Angriffs aus dem internen =
Netzwerk.=0A=0ABeim Bootvorgang der Client-Rechners kommt es zu einem =
Fehler in LINBO der das Herunterladen von Konfigurationsdateien via rsync =
verhindert, so dass weder am Anfang die Partitionierung vorgenommen noch =
am Ende das Image auf den Server kopiert werden kann.=0AEs wurde ein =
entsprechender [Fehlerbericht][6] =C3=BCbermittelt, der aufgrund vorgeblich=
 fehlender Reproduzierbarkeit geschlossen wurde. Auf eine sp=C3=A4tere =
Erg=C3=A4nzung mit einer genauen Fehlerdiagnose erfolgte bislang keine =
Reaktion.=0ADieser Fehler verhinderte eine weiter Arbeit mit LinuxMuster.=
=0A=0A=0A[1]: https://ubuntu.com/18-04=0A[2]: https://ubuntu.com/pro=0A[3]:=
 https://docs.linuxmuster.net/de/v7.2/about/what-is-new.html#what-is-new-la=
bel=0A[4]: https://docs.linuxmuster.net/de/v7.1/installation/install-from-s=
cratch/basis_server.html#basis-konfiguration-des-servers=0A[5]: https://doc=
s.linuxmuster.net/de/v7.1/installation/install-from-scratch/lmn_pre_install=
.html#server-auf-lmn7-1-vorbereiten=0A[6]: https://github.com/linuxmuster/l=
inuxmuster-linbo7/issues/93=0A=0A[^1]: <https://docs.linuxmuster.net/de/v7.=
2/about/what-is-new.html> (abgerufen am 12.2.2023)=0A[^2]: so schl=C3=A4gt =
z.B. auf <https://docs.linuxmuster.net/de/v7.1/installation/install-from-sc=
ratch/lmn_pre_install.html#server-auf-lmn7-1-vorbereiten> das Kommando =
`sudo wget -qO- "https://deb.linuxmuster.net/pub.gpg" | gpg --dearmour -o =
/usr/share/keyrings/linuxmuster.net.gpg` fehl, weil das `sudo` falsch =
platziert ist=0A[^3]: <https://ask.linuxmuster.net/t/authentication-failed-=
webui-server/9671>=0A      <https://ask.linuxmuster.net/t/timeout-bei-anmel=
dung-im-webui/10277>=0A      <https://ask.linuxmuster.net/t/einloggen-in-sc=
hulkonsole-nach-update-nicht-mehr-moeglich/10070>=0A      <https://ask.linu=
xmuster.net/t/erstinstallation-anmeldung-nicht-moeglich-und-fehler-in-ajent=
i-log/10515>=0A[^4]: verwendetes Kommando: `linuxmuster-setup --unattended =
--servername=3D"server" --domainname=3D"linuxmuster.lan" --dhcprange=3D"10.=
0.0.100 10.0.0.200" --schoolname=3D"Musterschule" --location=3D"Musterstadt=
" --country=3D"de" --state=3D"SH" --adminpw=3D"linuxmuster" --skip-fw`=0A

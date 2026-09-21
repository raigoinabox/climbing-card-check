export function sendForgotPasswordEmail(email: string, token: string) {
  const tokenUrl = createUrl(`/reset-password`, { token });

  return sendEmail(
    email,
    "Uue parooli määramine",
    `Tere!

Teie kontole paluti paroolivahetust.

Selle jaoks minge lingile ${tokenUrl} ja sättige endale uus parool. See link
kehtib tund aega.

Kui see ei olnud teie, siis te ei pea midagi tegema.

Tänades
Ronimisliidu meeskond`,
    `<p>Tere!</p>
<p>Teie kontole paluti paroolivahetust.</p>
<p>Selle jaoks minge <a href="${tokenUrl}">siia</a> ja sättige endale uus 
parool. See link kehtib tund aega.</p>
<p>Kui see ei olnud teie, siis te ei pea midagi tegema.</p>
<p>Tänades<br />
Ronimisliidu meeskond</p>`,
  );
}

export function sendRegistrationEmail(email: string, uuid: string) {
  const registrationUrl = createUrl(`/register-exam/climber-${uuid}`);

  return sendEmail(
    email,
    "Teid lisati julgestajakaartide registrisse",
    `Tere!

Teid lisati julgestajakaartide registrisse. Kaardi aktiviseerimiseks mine
lingile (${registrationUrl}) ja vii oma registreerimine lõpuni

1. Kinnitage nõusolek andmekaitse tingimuste ja omavastutusdeklaratsiooniga.
2. Makske registreerimistasu ${REGISTRATION_FEE}€.

Tänades
Ronimisliidu meeskond`,
    `<p>Tere!</p>
    <p>Teid lisati julgestajakaartide registrisse. Kaardi aktiviseerimiseks mine
    <a href="${registrationUrl}">siia</a> ja vii oma registreerimine lõpuni</p>
    <ol>
      <li>Kinnitage nõusolek andmekaitse tingimuste ja omavastutusdeklaratsiooniga</li>
      <li>Makske registreerimistasu ${REGISTRATION_FEE}€</li>
    </ol>
    <p>Tänades<br />
    Ronimisliidu meeskond</p>`,
  );
}

export function sendRejectionEmail(email: string) {
  return sendEmail(
    email,
    "Teid eemaldati julgestajakaartide registrist",
    `Tere!

Seoses ronimisliidu tasu maksu tagasi võtmisega on teid meie julgestajakaarti
registrist eemaldatud.

Parimat
Ronimisliidu meeskond`,
    `<p>Tere!</p>
<p>Seoses ronimisliidu tasu maksu tagasi võtmisega on teid meie julgestajakaarti
registrist eemaldatud.</p>
<p>Parimat<br />
Ronimisliidu meeskond</p>`,
  );
}

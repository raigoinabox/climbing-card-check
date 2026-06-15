export function sendRegistrationEmail(email: string, uuid: string) {
  const registrationUrl = createUrl(`/register-exam/climber-${uuid}`);

  return sendEmail(
    email,
    "Teid lisati julgestajakaartide registrisse",
    `Tere!
        
    Teid lisati julgestajakaartide registrisse. Kaardi aktiviseerimiseks mine
    lingile (${registrationUrl}) ja vii oma
    registreerimine lõpuni
    
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

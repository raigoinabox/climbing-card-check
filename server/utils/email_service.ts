export function sendForgotPasswordEmail(email: string, token: string) {
  const tokenUrl = createUrl(`/reset-password`, { token });

  return sendEmail(
    email,
    "Uue parooli määramine",
    `Tere!

Teie kontole paluti paroolivahetust.

Selle jaoks minge [siia](${tokenUrl}) ja sättige endale uus parool. See link
kehtib tund aega.

Kui see ei olnud teie, siis te ei pea midagi tegema.

Tänades,  
Ronimisliidu meeskond`,
  );
}

export function sendRegistrationEmail(
  email: string,
  uuid: string,
  cardType: "roheline" | "punane",
) {
  let typeDescription;
  if (cardType == "roheline") {
    typeDescription = "rohelise";
  } else if (cardType == "punane") {
    typeDescription = "punase";
  } else {
    const exhaustivenessCheck: never = cardType;
    console.log("Never hit", exhaustivenessCheck);
  }

  const registrationUrl = createUrl(`/exams/climber-${uuid}`);

  return sendEmail(
    email,
    "Teid lisati Ronimisliidu julgestajakaartide registrisse",
    `Tere!

Teie instruktor on kinnitanud, et olete edukalt läbinud ${typeDescription} kaardi
eksami. Selleks, et saaksime teid registrisse kanda, on tarvis vajutada järgmist
[linki](${registrationUrl}) ja

1. lugeda läbi andmekaitse tingimused ning anda nõusoleku andmete töötluseks
2. lugeda läbi omavastutusdeklaratsioon ning kinnitada sellega nõustumist
3. maksta Ronimisliidule registreerimistasu ${REGISTRATION_FEE}€.

Kui see kõik on tehtud, siis on teie registreerimine lõpuni viidud ja teil on
kehtiv kaart.

Tänades,  
Ronimisliidu meeskond`,
  );
}

export function sendRejectionEmail(email: string) {
  return sendEmail(
    email,
    "Teid eemaldati julgestajakaartide registrist",
    `Tere!

Seoses ronimisliidu tasu makse tagasi võtmisega on teid meie julgestajakaarti
registrist eemaldatud.

Parimat,  
Ronimisliidu meeskond`,
  );
}

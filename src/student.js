export class StudentInfo {
    /**
     * @type {string}
     */
    name = null;

    /**
     * @type {string?}
     */
    middleName = null;

    /**
     * @type {string}
     */
    lastName = null;

    /**
     * @type {string?}
     */
    familyName = null;

    /**
     * @type {string}
     */
    fullName = null;

    /**
     * @type {Date}
     */
    birthDate = null;

    /**
     * @type {string?}
     */
    birthPlace = null;

    /**
     * @type {boolean}
     */
    hasPolishCitizenship = null;

    /**
     * @type {"male"|"female"}
     */
    gender = null;

    /**
     * @type {string}
     */
    address = null;

    /**
     * @type {string}
     */
    registeredAddress = null;

    /**
     * @type {string}
     */
    correspondenceAddress = null;

    /**
     * @type {string?}
     */
    homePhone = null;

    /**
     * @type {string?}
     */
    phone = null;

    /**
     * @type {string?}
     */
    email = null;

    /**
     * @type {boolean}
     */
    isPeselVisible = null;

    /**
     * @type {boolean}
     */
    isAddressVisible = null;

    /**
     * @type {boolean}
     */
    isPhotoVisivle = null;

    /**
     * @type {boolean}
     */
    hasPesel = null;

    /**
     * @type {boolean}
     */
    isPole = null;

    /**
     * @type {StudentGuardian[]}
     */
    guardians = []
}

export class StudentGuardian {
    /**
     * @type {number}
     */
    id = null;

    /**
     * @type {string}
     */
    name = null;

    /**
     * @type {string}
     */
    lastName = null;

    /**
     * @type {string}
     */
    fullName = null;

    /**
     * @type {string?}
     */
    kinship = null;

    /**
     * @type {string}
     */
    address = null;

    /**
     * @type {string?}
     */
    homePhone = null;

    /**
     * @type {string?}
     */
    cellPhone = null;

    /**
     * @type {string?}
     */
    workPhone = null;

    /**
     * @type {string?}
     */
    email = null;

    /**
     * @type {string?}
     */
    phone = null;
}
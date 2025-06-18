import pool from './bd.js';


/**
 * Insère des données dans une table.
 * 
 * @param {string} tableName - Le nom de la table.
 * @param {object} data - Les données à insérer sous forme d'objet { colonne: valeur }.
 * @returns {Promise} - Une promesse qui se résout une fois l'insertion effectuée.
 */
export async function insertData(tableName, data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
  
      const query = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  
      const result = await pool.query(query, values);
      //console.log(`Inserted data into ${tableName}:`, result.rows[0]);
      return result.rowCount;
    } catch (err) {
      console.error('Error inserting data:', err);
      //throw err;
    }
  }


/**
 * Supprime des données d'une table en fonction des critères donnés.
 * 
 * @param {string} tableName - Le nom de la table.
 * @param {object} criteria - Les critères de suppression sous forme d'objet { colonne: valeur }.
 * @returns {Promise} - Une promesse qui se résout une fois la suppression effectuée.
 */
export async function deleteData(tableName, criteria) {
    try {
      const keys = Object.keys(criteria);
      const values = Object.values(criteria);
      
      // Construire la clause WHERE avec des placeholders
      const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
      
      // Construire la requête SQL
      const query = `DELETE FROM ${tableName} WHERE ${whereClause}`;
  
      // Exécuter la requête avec les valeurs
      const result = await pool.query(query, values);
  
      //console.log(`Deleted ${result.rowCount} row(s) from ${tableName}.`);
      return result.rowCount;
    } catch (err) {
      console.error('Error deleting data:', err);
      //throw err;
    }
  }

  /**
 * Récupère des données d'une table en fonction des critères donnés.
 * 
 * @param {string} tableName - Le nom de la table.
 * @param {object} [criteria] - (Facultatif) Les critères de récupération sous forme d'objet { colonne: valeur }.
 * @returns {Promise} - Une promesse qui se résout avec les données récupérées.
 */
export async function getData(tableName, criteria = {}) {
    try {
      const keys = Object.keys(criteria);
      const values = Object.values(criteria);
  
      let whereClause = '';
      if (keys.length > 0) {
        whereClause = 'WHERE ' + keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
      }
  
      const query = `SELECT * FROM ${tableName} ${whereClause}`;
  
      const result = await pool.query(query, values);
      //console.log(`Retrieved data from ${tableName}:`, result.rows);
      return result.rows;
    } catch (err) {
      console.error('Error retrieving data:', err);
      //throw err;
    }
  }

    /**
 * met à jour les des données d'une table en fonction des critères de selection donnés.
 * 
 * @param {string} table - Le nom de la table.
 * @param {object} updates - objet contenant les colonnes à mettre à jour et leurs nouvelles valeurs 
 * @param {object} [criteria] - (Facultatif) Les critères de récupération sous forme d'objet { colonne: valeur }.
 * @returns {Promise} - Une promesse qui se résout avec les données récupérées.
 */
  export async function updateData(table, updates, criteria) {
    // Construction de la chaîne de colonnes à mettre à jour
    const updateFields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
  
    // Construction de la chaîne de critères
    const whereClauses = Object.keys(criteria)
      .map((key, index) => `${key} = $${index + 1 + Object.keys(updates).length}`)
      .join(' AND ');
  
    // Construction de la requête SQL
    const query = `
      UPDATE ${table}
      SET ${updateFields}
      WHERE ${whereClauses}
    `;
  
    // Concaténation des valeurs pour les colonnes et les critères
    const values = [...Object.values(updates), ...Object.values(criteria)];
  
    try {
      const res = await pool.query(query, values);
      //console.log('Données mises à jour:', res.rowCount);
      return res.rowCount; // Nombre de lignes affectées
    } catch (err) {
      console.error('Erreur de mise à jour des données:', err);
      //throw err;
    }
  }

  export async function upsertData(table, data, conflictColumn) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  
    const updateClause = columns
      .map((col, index) => `${col} = $${index + 1 + columns.length}`)
      .join(', ');
  
    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (${conflictColumn})
      DO UPDATE SET ${updateClause};
    `;
  
    try {
      //await pool.query(query, values);
      await pool.query(query, [...values, ...values]);
      console.log('Données insérées ou mises à jour avec succès.');
    } catch (err) {
      console.error('Erreur lors de l\'insertion ou de la mise à jour :', err);
      //throw err;
    }
  }

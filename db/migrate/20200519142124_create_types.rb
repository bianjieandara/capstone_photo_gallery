class CreateTypes < ActiveRecord::Migration
  def change
    create_table :types do |t|
      t.string :name
      t.integer :creator_id, {null:false}
      
      t.timestamps null: false
    end

    create_table :thing_types do |t|
      t.references :thing, {index: true, foreign_key: true, null:false}
      t.references :type, {index: true, foreign_key: true, null:false}
      t.integer :creator_id, {null:false}

      t.timestamps null: false
    end

    add_index :types, :creator_id
    add_index :thing_types, [:type_id, :thing_id], unique:true
    
  end
end

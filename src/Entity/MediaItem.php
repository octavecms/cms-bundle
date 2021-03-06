<?php

namespace Octave\CMSBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 *
 * @ORM\Entity(repositoryClass="Octave\CMSBundle\Repository\MediaItemRepository")
 * @ORM\Table(
 *     name="octave_media_items"
 * )
 */
class MediaItem
{
    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var MediaCategory
     * @ORM\ManyToOne(targetEntity="MediaCategory", inversedBy="items")
     */
    private $category;

    /**
     * @var string
     * @ORM\Column(type="string", length=255)
     */
    private $name;

    /**
     * @var string
     * @ORM\Column(type="string", length=512)
     */
    private $path;

    /**
     * @var integer
     * @ORM\Column(type="integer")
     */
    private $size = 0;

    /**
     * @var array
     * @ORM\Column(type="array", nullable=true)
     */
    private $info = [];

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return MediaCategory
     */
    public function getCategory()
    {
        return $this->category;
    }

    /**
     * @param MediaCategory $category
     */
    public function setCategory($category)
    {
        $this->category = $category;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @return string
     */
    public function getPath()
    {
        return $this->path;
    }

    /**
     * @param string $path
     */
    public function setPath($path)
    {
        $this->path = $path;
    }

    /**
     * @return array
     */
    public function getInfo()
    {
        return $this->info;
    }

    /**
     * @param array $info
     */
    public function setInfo($info)
    {
        $this->info = $info;
    }

    /**
     * @param $name
     * @return mixed|null
     */
    public function getInfoItem($name)
    {
        return $this->info[$name] ?? null;
    }

    /**
     * @return int
     */
    public function getSize()
    {
        return $this->size;
    }

    /**
     * @param int $size
     */
    public function setSize($size)
    {
        $this->size = $size;
    }
}
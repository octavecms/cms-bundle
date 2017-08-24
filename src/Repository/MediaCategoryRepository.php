<?php

namespace VideInfra\CMSBundle\Repository;

use Doctrine\ORM\EntityRepository;
use VideInfra\CMSBundle\Entity\MediaCategory;
use VideInfra\CMSBundle\Service\MediaCategoryTreeBuilder;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaCategoryRepository extends EntityRepository
{
    /** @var MediaCategoryTreeBuilder */
    private $treeBuilder;

    /**
     * @param MediaCategoryTreeBuilder $treeBuilder
     */
    public function setTreeBuilder(MediaCategoryTreeBuilder $treeBuilder)
    {
        $this->treeBuilder = $treeBuilder;
    }

    /**
     * @return array
     */
    public function getTree()
    {
        $categories = $this->createQueryBuilder('c')
            ->orderBy('c.name')
            ->andWhere('c.parent IS NULL')
            ->getQuery()
            ->getResult();

        $output = [];

        /** @var MediaCategory $category */
        foreach ($categories as $category) {
            $output[] = $this->treeBuilder->build($category);
        }

        return $output;
    }

    /**
     * @return MediaCategory
     */
    public function create()
    {
        $category = new MediaCategory();
        $this->getEntityManager()->persist($category);

        return $category;
    }
}